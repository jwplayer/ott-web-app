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
  PaymentWithoutDetails,
  PaymentWithPayPal,
  UpdateOrder,
  UpdatePaymentWithPayPal,
} from '#types/checkout';
import { getOverrideIP } from '#src/utils/common';

export const getOffers: GetOffers = async (payload, sandbox) => {
  const offers = await Promise.all(
    payload.offerIds.map(async (offerId) => {
      const response = await getOffer({ offerId: offerId as string }, sandbox);

      if (response.errors.length > 0) {
        throw new Error(response.errors[0]);
      }

      return response.responseData;
    }),
  );

  return offers;
};

export const getOffer: GetOffer = async (payload, sandbox) => {
  return get(sandbox, `/offers/${payload.offerId}${getOverrideIP() ? '?customerIP=' + getOverrideIP() : ''}`);
};

export const createOrder: CreateOrder = async (payload, sandbox, jwt) => {
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

  return post(sandbox, '/orders', JSON.stringify(createOrderPayload), jwt);
};

export const getOrder: GetOrder = async ({ orderId }, sandbox, jwt) => {
  return get(sandbox, `/orders/${orderId}`, jwt);
};

export const updateOrder: UpdateOrder = async ({ order, ...payload }, sandbox, jwt) => {
  return patch(sandbox, `/orders/${order.id}`, JSON.stringify(payload), jwt);
};

export const getPaymentMethods: GetPaymentMethods = async (sandbox, jwt) => {
  return get(sandbox, '/payment-methods', jwt);
};

export const paymentWithoutDetails: PaymentWithoutDetails = async (payload, sandbox, jwt) => {
  return post(sandbox, '/payments', JSON.stringify(payload), jwt);
};

export const paymentWithPayPal: PaymentWithPayPal = async (payload, sandbox, jwt) => {
  const { order, successUrl, cancelUrl, errorUrl } = payload;

  const paypalPayload = {
    orderId: order.id,
    successUrl,
    cancelUrl,
    errorUrl,
  };

  return post(sandbox, '/connectors/paypal/v1/tokens', JSON.stringify(paypalPayload), jwt);
};

export const getEntitlements: GetEntitlements = async (payload, sandbox, jwt = '') => {
  return get(sandbox, `/entitlements/${payload.offerId}`, jwt);
};

export const createAdyenPaymentSession: GetAdyenPaymentSession = async (payload, sandbox, jwt) => {
  return await post(sandbox, '/connectors/adyen/sessions', JSON.stringify(payload), jwt);
};

export const initialAdyenPayment: GetInitialAdyenPayment = async (payload, sandbox, jwt) =>
  post(sandbox, '/connectors/adyen/initial-payment', JSON.stringify(payload), jwt);

export const finalizeAdyenPayment: GetFinalizeAdyenPayment = async (payload, sandbox, jwt) =>
  post(sandbox, '/connectors/adyen/initial-payment/finalize', JSON.stringify(payload), jwt);

export const updatePaymentMethodWithPayPal: UpdatePaymentWithPayPal = async (payload, sandbox, jwt) => {
  return post(sandbox, '/connectors/paypal/v1/payment_details/tokens', JSON.stringify(payload), jwt);
};

export const deletePaymentMethod: DeletePaymentMethod = async (payload, sandbox, jwt) => {
  return remove(sandbox, `/payment_details/${payload.paymentDetailsId}`, jwt);
};

export const addAdyenPaymentDetails: AddAdyenPaymentDetails = async (payload, sandbox, jwt) =>
  post(sandbox, '/connectors/adyen/payment-details', JSON.stringify(payload), jwt);

export const finalizeAdyenPaymentDetails: FinalizeAdyenPaymentDetails = async (payload, sandbox, jwt) =>
  post(sandbox, '/connectors/adyen/payment-details/finalize', JSON.stringify(payload), jwt);

export const cardPaymentProvider = 'adyen';

export const directPostCardPayment = async () => null;
