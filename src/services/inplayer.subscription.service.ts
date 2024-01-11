import i18next from 'i18next';
import InPlayer, { PaymentHistory, Card, GetItemAccessV1, SubscriptionDetails as InplayerSubscription } from '@inplayer-org/inplayer.js';
import { injectable } from 'inversify';

import SubscriptionService from './subscription.service';

import type {
  GetActivePayment,
  GetActiveSubscription,
  GetAllTransactions,
  PaymentDetail,
  Subscription,
  Transaction,
  UpdateCardDetails,
  UpdateSubscription,
  ChangeSubscription,
} from '#types/subscription';
import type { Config } from '#types/Config';
import { isCommonError } from '#src/utils/api';

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

@injectable()
export default class InplayerSubscriptionService extends SubscriptionService {
  private formatCardDetails = (card: Card & { card_type: string; account_id: number; currency: string }): PaymentDetail => {
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

  private formatTransaction = (transaction: PaymentHistory): Transaction => {
    const purchasedAmount = transaction?.charged_amount?.toString() || '0';

    return {
      transactionId: transaction.transaction_token || i18next.t('user:payment.access_granted'),
      transactionDate: transaction.created_at,
      trxToken: transaction.trx_token,
      offerId: transaction.item_id?.toString() || i18next.t('user:payment.no_transaction'),
      offerType: transaction.item_type || '',
      offerTitle: transaction?.item_title || '',
      offerPeriod: '',
      transactionPriceExclTax: purchasedAmount,
      transactionCurrency: transaction.currency_iso || 'EUR',
      discountedOfferPrice: purchasedAmount,
      offerCurrency: transaction.currency_iso || 'EUR',
      offerPriceExclTax: purchasedAmount,
      applicableTax: '0',
      transactionPriceInclTax: purchasedAmount,
      customerId: transaction.consumer_id?.toString(),
      customerEmail: '',
      customerLocale: '',
      customerCountry: 'en',
      customerIpCountry: '',
      customerCurrency: '',
      paymentMethod: transaction.payment_method_name || i18next.t('user:payment.access_granted'),
    };
  };

  private formatActiveSubscription = (subscription: SubscriptionDetails, expiresAt: number) => {
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

  private formatGrantedSubscription = (subscription: GetItemAccessV1) => {
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

  getActiveSubscription: GetActiveSubscription = async ({ config }: { config: Config }) => {
    try {
      const assetId = config.integrations.jwp?.assetId || 0;
      const hasAccess = await InPlayer.Asset.checkAccessForAsset(assetId);

      if (hasAccess) {
        const { data } = await InPlayer.Subscription.getSubscriptions();
        const activeSubscription = data.collection.find((subscription: SubscriptionDetails) => subscription.item_id === assetId);

        if (activeSubscription) {
          return this.formatActiveSubscription(activeSubscription, hasAccess?.data?.expires_at);
        }

        return this.formatGrantedSubscription(hasAccess.data);
      }
      return null;
    } catch (error: unknown) {
      if (isCommonError(error) && error.response.data.code === 402) {
        return null;
      }
      throw new Error('Unable to fetch customer subscriptions.');
    }
  };

  getAllTransactions: GetAllTransactions = async () => {
    try {
      const { data } = await InPlayer.Payment.getPaymentHistory();

      return data?.collection?.map((transaction) => this.formatTransaction(transaction));
    } catch {
      throw new Error('Failed to get transactions');
    }
  };

  getActivePayment: GetActivePayment = async () => {
    try {
      const { data } = await InPlayer.Payment.getDefaultCreditCard();
      const cards: PaymentDetail[] = [];
      for (const currency in data?.cards) {
        cards.push(
          this.formatCardDetails({
            ...data.cards?.[currency],
            currency: currency,
          }),
        );
      }
      return cards.find((paymentDetails) => paymentDetails.active) || null;
    } catch {
      return null;
    }
  };

  getSubscriptions = async () => {
    return {
      errors: [],
      responseData: { items: [] },
    };
  };

  updateSubscription: UpdateSubscription = async ({ offerId, unsubscribeUrl }) => {
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

  changeSubscription: ChangeSubscription = async ({ accessFeeId, subscriptionId }) => {
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

  updateCardDetails: UpdateCardDetails = async ({ cardName, cardNumber, cvc, expMonth, expYear, currency }) => {
    try {
      const response = await InPlayer.Payment.setDefaultCreditCard({ cardName, cardNumber, cvc, expMonth, expYear, currency });
      return {
        errors: [],
        responseData: response.data,
      };
    } catch {
      throw new Error('Failed to update card details');
    }
  };

  fetchReceipt = async ({ transactionId }: { transactionId: string }) => {
    try {
      const { data } = await InPlayer.Payment.getBillingReceipt({ trxToken: transactionId });
      return {
        errors: [],
        responseData: data,
      };
    } catch {
      throw new Error('Failed to get billing receipt');
    }
  };

  getPaymentDetails = undefined;

  getTransactions = undefined;
}
