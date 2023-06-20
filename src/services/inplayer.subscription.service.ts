import i18next from 'i18next';
import InPlayer, { PurchaseDetails, Card, GetItemAccessV1, SubscriptionDetails as InplayerSubscription } from '@inplayer-org/inplayer.js';

import type { ChangeSubscription, PaymentDetail, Subscription, Transaction, UpdateCardDetails, UpdateSubscription } from '#types/subscription';
import type { Config } from '#types/Config';
import type { InPlayerError } from '#types/inplayer';

interface SubscriptionDetails extends InplayerSubscription {
  item_id?: number;
  item_title?: string;
  subscription_id?: string;
  subscription_price?: number;
  action_type?: 'recurrent' | 'canceled' | 'free-trial' | 'ended' | 'incomplete_expired';
  next_rebill_date?: number;
  charged_amount?: number;
  payment_method_name?: string;
  access_type?: {
    period: string;
  };
  access_fee_id?: number;
}

export async function getActiveSubscription({ config }: { config: Config }) {
  try {
    const assetId = config.integrations.jwp?.assetId || 0;
    const hasAccess = await InPlayer.Asset.checkAccessForAsset(assetId);

    if (hasAccess) {
      const { data } = await InPlayer.Subscription.getSubscriptions();
      const activeSubscription = data.collection.find((subscription: SubscriptionDetails) => subscription.item_id === assetId);

      if (activeSubscription) {
        return formatActiveSubscription(activeSubscription, hasAccess?.data?.expires_at);
      }

      return formatGrantedSubscription(hasAccess.data);
    }
    return null;
  } catch (error: unknown) {
    const { response } = error as InPlayerError;
    if (response.data.code === 402) {
      return null;
    }
    throw new Error('Unable to fetch customer subscriptions.');
  }
}

export async function getAllTransactions() {
  try {
    const { data } = await InPlayer.Payment.getPurchaseHistory('active', 0, 30);

    return data?.collection?.map((transaction) => formatTransaction(transaction));
  } catch {
    throw new Error('Failed to get transactions');
  }
}
export async function getActivePayment() {
  try {
    const { data } = await InPlayer.Payment.getDefaultCreditCard();
    const cards: PaymentDetail[] = [];
    for (const currency in data?.cards) {
      cards.push(
        // @ts-ignore
        // TODO fix Card type in InPlayer SDK
        formatCardDetails({
          ...data.cards?.[currency],
          currency: currency,
        }),
      );
    }
    return cards.find((paymentDetails) => paymentDetails.active) || null;
  } catch {
    return null;
  }
}
export const getSubscriptions = async () => {
  return {
    errors: [],
    responseData: { items: [] },
  };
};

export const updateSubscription: UpdateSubscription = async ({ offerId, unsubscribeUrl }) => {
  if (!unsubscribeUrl) {
    throw new Error('Missing unsubscribe url');
  }
  try {
    await InPlayer.Subscription.cancelSubscription(unsubscribeUrl);
    return {
      errors: [],
      responseData: { offerId: offerId, status: 'cancelled', expiresAt: 0 },
    };
  } catch {
    throw new Error('Failed to update subscription');
  }
};

export const changeSubscription: ChangeSubscription = async ({ accessFeeId, subscriptionId }) => {
  try {
    const response = await InPlayer.Subscription.changeSubscriptionPlan({ access_fee_id: parseInt(accessFeeId), inplayer_token: subscriptionId });
    return {
      errors: [],
      responseData: { message: response.data.message },
    };
  } catch {
    throw new Error('Failed to change subscription');
  }
};

export const updateCardDetails: UpdateCardDetails = async ({ cardName, cardNumber, cvc, expMonth, expYear, currency }) => {
  try {
    const response = await InPlayer.Payment.setDefaultCreditCard({ cardName, cardNumber, cvc, expMonth, expYear, currency });

    return { responseData: response.data, errors: [] };
  } catch {
    throw new Error('Failed to update card details');
  }
};

const formatCardDetails = (card: Card & { card_type: string; account_id: number; currency: string }): PaymentDetail => {
  const { number, exp_month, exp_year, card_name, card_type, account_id, currency } = card;
  const zeroFillExpMonth = `0${exp_month}`.slice(-2);
  return {
    customerId: account_id.toString(),
    paymentMethodSpecificParams: {
      holderName: card_name,
      variant: card_type,
      lastCardFourDigits: number,
      cardExpirationDate: `${zeroFillExpMonth}/${exp_year}`,
    },
    active: true,
    currency,
  } as PaymentDetail;
};

const formatTransaction = (transaction: PurchaseDetails): Transaction => {
  const purchasedAmount = transaction?.purchased_amount?.toString() || '0';

  return {
    transactionId: transaction.parent_resource_id || i18next.t('user:payment.access_granted'),
    transactionDate: transaction.created_at,
    offerId: transaction.purchased_access_fee_id?.toString() || i18next.t('user:payment.no_transaction'),
    offerType: transaction.type || '',
    offerTitle: transaction?.purchased_access_fee_description || '',
    offerPeriod: '',
    transactionPriceExclTax: purchasedAmount,
    transactionCurrency: transaction.purchased_currency || 'EUR',
    discountedOfferPrice: purchasedAmount,
    offerCurrency: transaction.purchased_currency || 'EUR',
    offerPriceExclTax: purchasedAmount,
    applicableTax: '0',
    transactionPriceInclTax: purchasedAmount,
    customerId: transaction.customer_id?.toString(),
    customerEmail: transaction.consumer_email,
    customerLocale: '',
    customerCountry: 'en',
    customerIpCountry: '',
    customerCurrency: '',
    paymentMethod: transaction.payment_method || i18next.t('user:payment.access_granted'),
  };
};

const formatActiveSubscription = (subscription: SubscriptionDetails, expiresAt: number) => {
  let status = '';
  switch (subscription.action_type) {
    case 'free-trial':
      status = 'active_trial';
      break;
    case 'recurrent':
      status = 'active';
      break;
    case 'canceled':
      status = 'cancelled';
      break;
    case 'incomplete_expired' || 'ended':
      status = 'expired';
      break;
    default:
      status = 'terminated';
  }

  return {
    subscriptionId: subscription.subscription_id,
    offerId: subscription.item_id?.toString(),
    accessFeeId: `S${subscription.access_fee_id}`,
    status,
    expiresAt,
    nextPaymentAt: subscription.next_rebill_date,
    nextPaymentPrice: subscription.subscription_price,
    nextPaymentCurrency: subscription.currency,
    paymentGateway: 'stripe',
    paymentMethod: subscription.payment_method_name,
    offerTitle: subscription.item_title,
    period: subscription.access_type?.period,
    totalPrice: subscription.charged_amount,
    unsubscribeUrl: subscription.unsubscribe_url,
    pendingSwitchId: null,
  } as Subscription;
};

const formatGrantedSubscription = (subscription: GetItemAccessV1) => {
  return {
    subscriptionId: '',
    offerId: subscription.item.id.toString(),
    status: 'active',
    expiresAt: subscription.expires_at,
    nextPaymentAt: subscription.expires_at,
    nextPaymentPrice: 0,
    nextPaymentCurrency: 'EUR',
    paymentGateway: 'none',
    paymentMethod: i18next.t('user:payment.access_granted'),
    offerTitle: subscription.item.title,
    period: 'granted',
    totalPrice: 0,
    unsubscribeUrl: '',
    pendingSwitchId: null,
  } as Subscription;
};
