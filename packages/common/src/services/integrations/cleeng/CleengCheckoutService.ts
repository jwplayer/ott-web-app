import { inject, injectable } from 'inversify';

import type {
  AddAdyenPaymentDetails,
  CreateOrder,
  CreateOrderPayload,
  DeletePaymentMethod,
  FinalizeAdyenPaymentDetails,
  GetAdyenPaymentSession,
  GetEntitlements,
  GetFinalizeAdyenPayment,
  GetInitialAdyenPayment,
  GetOffer,
  GetOffers,
  GetOrder,
  GetPaymentMethods,
  GetSubscriptionSwitch,
  GetSubscriptionSwitches,
  PaymentWithoutDetails,
  PaymentWithPayPal,
  SwitchSubscription,
  UpdateOrder,
  UpdateOrderResponse,
  UpdatePaymentWithPayPal,
} from '../../../../types/checkout';
import CheckoutService from '../CheckoutService';
import { GET_CUSTOMER_IP } from '../../../modules/types';
import type { GetCustomerIP } from '../../../../types/get-customer-ip';
import type { ServiceResponse } from '../../../../types/service';

import CleengService from './CleengService';

@injectable()
export default class CleengCheckoutService extends CheckoutService {
  private readonly cleengService: CleengService;
  private readonly getCustomerIP: GetCustomerIP;

  constructor(cleengService: CleengService, @inject(GET_CUSTOMER_IP) getCustomerIP: GetCustomerIP) {
    super();
    this.cleengService = cleengService;
    this.getCustomerIP = getCustomerIP;
  }

  getOffers: GetOffers = async (payload) => {
    return await Promise.all(
      payload.offerIds.map(async (offerId) => {
        const response = await this.getOffer({ offerId: String(offerId) });

        if (response.errors.length > 0) {
          throw new Error(response.errors[0]);
        }

        return response.responseData;
      }),
    );
  };

  getOffer: GetOffer = async (payload) => {
    const customerIP = await this.getCustomerIP();

    return this.cleengService.get(`/offers/${payload.offerId}${customerIP ? '?customerIP=' + customerIP : ''}`);
  };

  createOrder: CreateOrder = async (payload) => {
    const locales = await this.cleengService.getLocales();

    if (locales.errors.length > 0) throw new Error(locales.errors[0]);

    const customerIP = locales.responseData.ipAddress;

    const createOrderPayload: CreateOrderPayload = {
      offerId: payload.offer.offerId,
      customerId: payload.customerId,
      country: payload.country,
      currency: locales?.responseData?.currency || 'EUR',
      customerIP,
      paymentMethodId: payload.paymentMethodId,
    };

    return this.cleengService.post('/orders', JSON.stringify(createOrderPayload), { authenticate: true });
  };

  getOrder: GetOrder = async ({ orderId }) => {
    return this.cleengService.get(`/orders/${orderId}`, { authenticate: true });
  };

  updateOrder: UpdateOrder = async ({ order, ...payload }) => {
    const response = await this.cleengService.patch<ServiceResponse<UpdateOrderResponse>>(`/orders/${order.id}`, JSON.stringify(payload), {
      authenticate: true,
    });

    if (response.errors.length) {
      if (response.errors[0].includes(`Order with ${order.id} not found`)) {
        throw new Error('Order not found');
      }

      if (response.errors[0].includes(`Coupon ${payload.couponCode} not found`)) {
        throw new Error('Invalid coupon code');
      }
    }

    return response;
  };

  getPaymentMethods: GetPaymentMethods = async () => {
    return this.cleengService.get('/payment-methods', { authenticate: true });
  };

  paymentWithoutDetails: PaymentWithoutDetails = async (payload) => {
    return this.cleengService.post('/payments', JSON.stringify(payload), { authenticate: true });
  };

  paymentWithPayPal: PaymentWithPayPal = async (payload) => {
    const { order, successUrl, cancelUrl, errorUrl } = payload;

    const paypalPayload = {
      orderId: order.id,
      successUrl,
      cancelUrl,
      errorUrl,
    };

    return this.cleengService.post('/connectors/paypal/v1/tokens', JSON.stringify(paypalPayload), { authenticate: true });
  };

  getSubscriptionSwitches: GetSubscriptionSwitches = async (payload) => {
    return this.cleengService.get(`/customers/${payload.customerId}/subscription_switches/${payload.offerId}/availability`, { authenticate: true });
  };

  getSubscriptionSwitch: GetSubscriptionSwitch = async (payload) => {
    return this.cleengService.get(`/subscription_switches/${payload.switchId}`, { authenticate: true });
  };

  switchSubscription: SwitchSubscription = async (payload) => {
    return this.cleengService.post(
      `/customers/${payload.customerId}/subscription_switches/${payload.offerId}`,
      JSON.stringify({ toOfferId: payload.toOfferId, switchDirection: payload.switchDirection }),
      { authenticate: true },
    );
  };

  getEntitlements: GetEntitlements = async (payload) => {
    return this.cleengService.get(`/entitlements/${payload.offerId}`, { authenticate: true });
  };

  createAdyenPaymentSession: GetAdyenPaymentSession = async (payload) => {
    return await this.cleengService.post('/connectors/adyen/sessions', JSON.stringify(payload), { authenticate: true });
  };

  initialAdyenPayment: GetInitialAdyenPayment = async (payload) =>
    this.cleengService.post(
      '/connectors/adyen/initial-payment',
      JSON.stringify({ ...payload, attemptAuthentication: this.cleengService.sandbox ? 'always' : undefined }),
      { authenticate: true },
    );

  finalizeAdyenPayment: GetFinalizeAdyenPayment = async (payload) =>
    this.cleengService.post('/connectors/adyen/initial-payment/finalize', JSON.stringify(payload), { authenticate: true });

  updatePaymentMethodWithPayPal: UpdatePaymentWithPayPal = async (payload) => {
    return this.cleengService.post('/connectors/paypal/v1/payment_details/tokens', JSON.stringify(payload), { authenticate: true });
  };

  deletePaymentMethod: DeletePaymentMethod = async (payload) => {
    return this.cleengService.remove(`/payment_details/${payload.paymentDetailsId}`, { authenticate: true });
  };

  addAdyenPaymentDetails: AddAdyenPaymentDetails = async (payload) =>
    this.cleengService.post(
      '/connectors/adyen/payment-details',
      JSON.stringify({
        ...payload,
        attemptAuthentication: this.cleengService.sandbox ? 'always' : undefined,
      }),
      { authenticate: true },
    );

  finalizeAdyenPaymentDetails: FinalizeAdyenPaymentDetails = async (payload) =>
    this.cleengService.post('/connectors/adyen/payment-details/finalize', JSON.stringify(payload), { authenticate: true });

  directPostCardPayment = async () => false;
}
