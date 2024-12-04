import i18next from 'i18next';
import { inject, injectable, named } from 'inversify';

import type {
  ChangeSubscription,
  GetActivePayment,
  GetActiveSubscription,
  GetAllTransactions,
  PaymentDetail,
  Subscription,
  Transaction,
  UpdateCardDetails,
  UpdateSubscription,
} from '../../../../types/subscription';
import SubscriptionService from '../SubscriptionService';
import AccountService from '../AccountService';

import type {
  GetItemAccessResponse,
  GetSubscriptionsResponse,
  GetPaymentHistoryResponse,
  GetDefaultCardResponse,
  CancelSubscriptionResponse,
  ChangeSubscriptionPlanResponse,
  SetDefaultCardResponse,
  Card,
  PaymentHistory,
  JWPSubscription,
} from './types';
import type JWPAccountService from './JWPAccountService';
import JWPAPIService from './JWPAPIService';

interface SubscriptionDetails extends JWPSubscription {
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
export default class JWPSubscriptionService extends SubscriptionService {
  protected readonly accountService: JWPAccountService;
  protected readonly apiService: JWPAPIService;

  constructor(@named('JWP') @inject(AccountService) accountService: AccountService, @inject(JWPAPIService) apiService: JWPAPIService) {
    super();

    this.accountService = accountService as JWPAccountService;
    this.apiService = apiService;
  }

  private formatCardDetails = (
    card: Card & {
      card_type: string;
      account_id: number;
      currency: string;
    },
  ): PaymentDetail => {
    const { number, exp_month, exp_year, card_name, card_type, account_id, currency } = card;
    const zeroFillExpMonth = `0${exp_month}`.slice(-2);

    return {
      id: 0,
      paymentMethodId: 0,
      paymentGateway: 'card',
      paymentMethod: 'card',
      customerId: account_id.toString(),
      paymentMethodSpecificParams: {
        holderName: card_name,
        variant: card_type,
        lastCardFourDigits: String(number),
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

  private formatGrantedSubscription = (subscription: GetItemAccessResponse) => {
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

  getActiveSubscription: GetActiveSubscription = async () => {
    const assetId = this.accountService.assetId;

    if (assetId === null) throw new Error("Couldn't fetch active subscription, there is no assetId configured");

    try {
      const hasAccess = await this.apiService.get<GetItemAccessResponse>(`/items/${assetId}/access`, {
        withAuthentication: true,
      });

      if (hasAccess) {
        const data = await this.apiService.get<GetSubscriptionsResponse>(
          '/subscriptions',
          {
            withAuthentication: true,
            contentType: 'json',
          },
          {
            limit: 15,
            page: 0,
          },
        );

        const activeSubscription = data.collection.find((subscription: SubscriptionDetails) => subscription.item_id === assetId);

        if (activeSubscription) {
          return this.formatActiveSubscription(activeSubscription, hasAccess?.expires_at);
        }

        return this.formatGrantedSubscription(hasAccess);
      }
      return null;
    } catch (error: unknown) {
      if (JWPAPIService.isCommonError(error) && error.response.data.code === 402) {
        return null;
      }
      throw new Error('Unable to fetch customer subscriptions.');
    }
  };

  getAllTransactions: GetAllTransactions = async () => {
    try {
      const data = await this.apiService.get<GetPaymentHistoryResponse>('/v2/accounting/payment-history', {
        withAuthentication: true,
        contentType: 'json',
      });

      return data?.collection?.map((transaction) => this.formatTransaction(transaction));
    } catch {
      throw new Error('Failed to get transactions');
    }
  };

  getActivePayment: GetActivePayment = async () => {
    try {
      const data = await this.apiService.get<GetDefaultCardResponse>('/v2/payments/cards/default', {
        withAuthentication: true,
        contentType: 'json',
      });

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
      await this.apiService.get<CancelSubscriptionResponse>(unsubscribeUrl, { withAuthentication: true, contentType: 'json' });
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
      const data = await this.apiService.post<ChangeSubscriptionPlanResponse>(
        '/v2/subscriptions/stripe:switch',
        {
          inplayer_token: subscriptionId,
          access_fee_id: accessFeeId,
        },
        {
          withAuthentication: true,
        },
      );
      return {
        errors: [],
        responseData: { message: data.message },
      };
    } catch {
      throw new Error('Failed to change subscription');
    }
  };

  updateCardDetails: UpdateCardDetails = async ({ cardName, cardNumber, cvc, expMonth, expYear, currency }) => {
    try {
      const responseData = await this.apiService.put<SetDefaultCardResponse>(
        '/v2/payments/cards/default',
        {
          number: cardNumber,
          card_name: cardName,
          cvv: cvc,
          exp_month: expMonth,
          exp_year: expYear,
          currency_iso: currency,
        },
        { withAuthentication: true },
      );

      return { errors: [], responseData };
    } catch {
      throw new Error('Failed to update card details');
    }
  };

  fetchReceipt = async ({ transactionId }: { transactionId: string }) => {
    try {
      const responseData = await this.apiService.get<Blob>(`/v2/accounting/transactions/${transactionId}/receipt`, {
        withAuthentication: true,
        contentType: 'json',
        responseType: 'blob',
      });

      return { errors: [], responseData };
    } catch {
      throw new Error('Failed to get billing receipt');
    }
  };

  getPaymentDetails = undefined;

  getTransactions = undefined;
}
