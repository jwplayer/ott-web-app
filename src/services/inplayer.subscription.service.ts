import InPlayer, { Card, SubscriptionDetails as InplayerSubscription } from '@inplayer-org/inplayer.js';

import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';
import type { Config } from '#types/Config';
import type { InPlayerPurchaseDetails } from '#types/inplayer';

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
}

export async function getActiveSubscription({ config }: { config: Config }) {
  try {
    const assetId = config.integrations.inplayer?.assetId || 0;
    const { data: hasAccess } = await InPlayer.Asset.checkAccessForAsset(assetId);

    if (hasAccess) {
      const { data } = await InPlayer.Subscription.getSubscriptions();
      const activeSubscription = data.collection.find((subscription: SubscriptionDetails) => subscription.item_id === assetId);
      if (activeSubscription) {
        return processActiveSubscription(activeSubscription);
      }
    }
    return null;
  } catch {
    throw new Error('Unable to fetch customer subscriptions.');
  }
}

export async function getAllTransactions() {
  try {
    const { data } = await InPlayer.Payment.getPurchaseHistory('active', 0, 30);
    // @ts-ignore
    // TODO fix PurchaseHistoryCollection type in InPlayer SDK
    return data?.collection?.map((transaction: InPlayerPurchaseDetails) => processTransaction(transaction));
  } catch {
    throw new Error('Failed to get transactions');
  }
}

export async function getActivePayment() {
  try {
    const { data } = await InPlayer.Payment.getDefaultCreditCard();
    const cards: PaymentDetail[] = [];
    for (const currency in data?.cards) {
      // @ts-ignore
      // TODO fix Card type in InPlayer SDK
      cards.push(processCardDetails(data.cards?.[currency]));
    }

    return cards.find((paymentDetails) => paymentDetails.active) || null;
  } catch {
    throw new Error('Failed to get payment details');
  }
}

export const getSubscriptions = async () => {
  return {
    errors: [],
    responseData: { items: [] },
  };
};

const processCardDetails = (card: Card & { card_type: string; account_id: number }): PaymentDetail => {
  const { number, exp_month, exp_year, card_name, card_type, account_id } = card;
  const zeroFillExpMonth = `0${exp_month}`.substring(-2);
  return {
    customerId: account_id.toString(),
    paymentMethodSpecificParams: {
      holderName: card_name,
      variant: card_type,
      lastCardFourDigits: number,
      cardExpirationDate: `${zeroFillExpMonth}/${exp_year}`,
    },
    active: true,
  } as PaymentDetail;
};

// TODO: fix PurchaseDetails type in InPlayer SDK
const processTransaction = (transaction: InPlayerPurchaseDetails): Transaction => {
  return {
    transactionId: transaction.parent_resource_id,
    transactionDate: transaction.created_at,
    offerId: transaction.purchased_access_fee_id?.toString(),
    offerType: transaction.type || '',
    offerTitle: transaction?.purchased_access_fee_description || '',
    offerPeriod: '',
    transactionPriceExclTax: transaction.purchased_amount?.toString(),
    transactionCurrency: transaction.purchased_currency,
    discountedOfferPrice: transaction.purchased_amount?.toString(),
    offerCurrency: transaction.purchased_currency,
    offerPriceExclTax: transaction.purchased_amount?.toString(),
    applicableTax: '0',
    transactionPriceInclTax: transaction.purchased_amount?.toString(),
    customerId: transaction.customer_id?.toString(),
    customerEmail: transaction.consumer_email,
    customerLocale: '',
    customerCountry: 'en',
    customerIpCountry: '',
    customerCurrency: '',
    paymentMethod: transaction.payment_method,
  };
};

const processActiveSubscription = (subscription: SubscriptionDetails) => {
  let status = '';
  switch (subscription.action_type) {
    case 'free-trial' || 'recurrent':
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
    status,
    expiresAt: subscription.next_rebill_date,
    nextPaymentAt: subscription.next_rebill_date,
    nextPaymentPrice: subscription.subscription_price,
    nextPaymentCurrency: subscription.currency,
    paymentGateway: 'stripe',
    paymentMethod: subscription.payment_method_name,
    offerTitle: subscription.item_title,
    period: subscription.access_type?.period,
    totalPrice: subscription.charged_amount,
  } as Subscription;
};
