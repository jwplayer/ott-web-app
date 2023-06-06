import { get, post, patch, remove } from './cleeng.service';
import { getLocales } from './cleeng.account.service';

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
  UpdatePaymentWithPayPal,
} from '#types/checkout';
import { getOverrideIP } from '#src/utils/common';

export const getOffers: GetOffers = async (payload, sandbox) => {
  return await Promise.all(
    payload.offerIds.map(async (offerId) => {
      const response = await getOffer({ offerId: offerId as string }, sandbox);

      if (response.errors.length > 0) {
        throw new Error(response.errors[0]);
      }

      return response.responseData;
    }),
  );
};

export const getOffer: GetOffer = async (payload, sandbox) => {
  return get(sandbox, `/offers/${payload.offerId}${getOverrideIP() ? '?customerIP=' + getOverrideIP() : ''}`);
};

export const createOrder: CreateOrder = async (payload, sandbox) => {
  const locales = await getLocales(sandbox);

  if (locales.errors.length > 0) throw new Error(locales.errors[0]);

  const createOrderPayload: CreateOrderPayload = {
    offerId: payload.offer.offerId,
    customerId: payload.customerId,
    country: payload.country,
    currency: locales?.responseData?.currency || 'EUR',
    customerIP: payload.customerIP,
    paymentMethodId: payload.paymentMethodId,
  };

  return post(sandbox, '/orders', JSON.stringify(createOrderPayload), { authenticate: true });
};

export const getOrder: GetOrder = async ({ orderId }, sandbox) => {
  return get(sandbox, `/orders/${orderId}`, { authenticate: true });
};

export const updateOrder: UpdateOrder = async ({ order, ...payload }, sandbox) => {
  return patch(sandbox, `/orders/${order.id}`, JSON.stringify(payload), { authenticate: true });
};

export const getPaymentMethods: GetPaymentMethods = async (sandbox) => {
  return get(sandbox, '/payment-methods', { authenticate: true });
};

export const paymentWithoutDetails: PaymentWithoutDetails = async (payload, sandbox) => {
  return post(sandbox, '/payments', JSON.stringify(payload), { authenticate: true });
};

export const paymentWithPayPal: PaymentWithPayPal = async (payload, sandbox) => {
  const { order, successUrl, cancelUrl, errorUrl } = payload;

  const paypalPayload = {
    orderId: order.id,
    successUrl,
    cancelUrl,
    errorUrl,
  };

  return post(sandbox, '/connectors/paypal/v1/tokens', JSON.stringify(paypalPayload), { authenticate: true });
};

export const getSubscriptionSwitches: GetSubscriptionSwitches = async (payload, sandbox) => {
  return get(sandbox, `/customers/${payload.customerId}/subscription_switches/${payload.offerId}/availability`, { authenticate: true });
};

export const getSubscriptionSwitch: GetSubscriptionSwitch = async (payload, sandbox) => {
  return get(sandbox, `/subscription_switches/${payload.switchId}`, { authenticate: true });
};

export const switchSubscription: SwitchSubscription = async (payload, sandbox) => {
  return post(
    sandbox,
    `/customers/${payload.customerId}/subscription_switches/${payload.offerId}`,
    JSON.stringify({ toOfferId: payload.toOfferId, switchDirection: payload.switchDirection }),
    { authenticate: true },
  );
};

export const getEntitlements: GetEntitlements = async (payload, sandbox) => {
  return get(sandbox, `/entitlements/${payload.offerId}`, { authenticate: true });
};

export const createAdyenPaymentSession: GetAdyenPaymentSession = async (payload, sandbox) => {
  return await post(sandbox, '/connectors/adyen/sessions', JSON.stringify(payload), { authenticate: true });
};

export const initialAdyenPayment: GetInitialAdyenPayment = async (payload, sandbox) =>
  post(sandbox, '/connectors/adyen/initial-payment', JSON.stringify(payload), { authenticate: true });

export const finalizeAdyenPayment: GetFinalizeAdyenPayment = async (payload, sandbox) =>
  post(sandbox, '/connectors/adyen/initial-payment/finalize', JSON.stringify(payload), { authenticate: true });

export const updatePaymentMethodWithPayPal: UpdatePaymentWithPayPal = async (payload, sandbox) => {
  return post(sandbox, '/connectors/paypal/v1/payment_details/tokens', JSON.stringify(payload), { authenticate: true });
};

export const deletePaymentMethod: DeletePaymentMethod = async (payload, sandbox) => {
  return remove(sandbox, `/payment_details/${payload.paymentDetailsId}`, { authenticate: true });
};

export const addAdyenPaymentDetails: AddAdyenPaymentDetails = async (payload, sandbox) =>
  post(sandbox, '/connectors/adyen/payment-details', JSON.stringify(payload), { authenticate: true });

export const finalizeAdyenPaymentDetails: FinalizeAdyenPaymentDetails = async (payload, sandbox) =>
  post(sandbox, '/connectors/adyen/payment-details/finalize', JSON.stringify(payload), { authenticate: true });

export const cardPaymentProvider = 'adyen';

export const directPostCardPayment = async () => null;
