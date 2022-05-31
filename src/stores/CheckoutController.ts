import type { CreateOrderPayload, UpdateOrderPayload } from '#types/checkout';
import { getLocales } from '#src/services/account.service';
import * as checkoutService from '#src/services/checkout.service';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { useCheckoutStore } from '#src/stores/CheckoutStore';

export const createOrder = async (offerId: string, paymentMethodId?: number) => {
  const { cleengSandbox, cleengId } = useConfigStore.getState().getCleengData();

  const { user, auth } = useAccountStore.getState();

  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const localesResponse = await getLocales(cleengSandbox);

  if (localesResponse.errors.length > 0) throw new Error(localesResponse.errors[0]);

  const createOrderPayload: CreateOrderPayload = {
    offerId,
    customerId: user.id,
    country: user.country,
    currency: localesResponse.responseData.currency,
    customerIP: user.lastUserIp,
    paymentMethodId,
  };

  const response = await checkoutService.createOrder(createOrderPayload, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) {
    useCheckoutStore.getState().setOrder(null);

    throw new Error(response.errors[0]);
  }

  useCheckoutStore.getState().setOrder(response.responseData?.order);
};

export const updateOrder = async (orderId: number, paymentMethodId?: number, couponCode?: string | null) => {
  const { cleengSandbox, cleengId } = useConfigStore.getState().getCleengData();

  const { user, auth } = useAccountStore.getState();

  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const updateOrderPayload: UpdateOrderPayload = {
    orderId,
    paymentMethodId,
    couponCode,
  };

  const response = await checkoutService.updateOrder(updateOrderPayload, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) {
    // clear the order when the order doesn't exist on the server
    if (response.errors[0].includes(`Order with ${orderId} not found`)) {
      useCheckoutStore.getState().setOrder(null);
    }

    throw new Error(response.errors[0]);
  }

  useCheckoutStore.getState().setOrder(response.responseData?.order);
};

export const getPaymentMethods = async () => {
  const { cleengSandbox, cleengId } = useConfigStore.getState().getCleengData();

  const { user, auth } = useAccountStore.getState();
  const { paymentMethods } = useCheckoutStore.getState();

  if (paymentMethods) return paymentMethods; // already fetched payment methods
  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const response = await checkoutService.getPaymentMethods(cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  useCheckoutStore.getState().setPaymentMethods(response.responseData?.paymentMethods);

  return response.responseData?.paymentMethods;
};

export const paymentWithoutDetails = async () => {
  const { cleengSandbox, cleengId } = useConfigStore.getState().getCleengData();

  const { user, auth } = useAccountStore.getState();
  const { order } = useCheckoutStore.getState();

  if (!order) throw new Error('No order created');
  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const response = await checkoutService.paymentWithoutDetails({ orderId: order.id }, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);
  if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

  return response.responseData;
};

export const adyenPayment = async (paymentMethod: AdyenPaymentMethod) => {
  const { cleengSandbox, cleengId } = useConfigStore.getState().getCleengData();
  const { user, auth } = useAccountStore.getState();
  const { order } = useCheckoutStore.getState();

  if (!order) throw new Error('No order created');
  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const response = await checkoutService.paymentWithAdyen(
    {
      orderId: order.id,
      card: paymentMethod,
    },
    cleengSandbox,
    auth.jwt,
  );

  if (response.errors.length > 0) throw new Error(response.errors[0]);
  if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

  return response.responseData;
};

export const paypalPayment = async (successUrl: string, cancelUrl: string, errorUrl: string) => {
  const { cleengSandbox, cleengId } = useConfigStore.getState().getCleengData();
  const { user, auth } = useAccountStore.getState();
  const { order } = useCheckoutStore.getState();

  if (!order) throw new Error('No order created');
  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const response = await checkoutService.paymentWithPayPal(
    {
      orderId: order.id,
      successUrl,
      cancelUrl,
      errorUrl,
    },
    cleengSandbox,
    auth.jwt,
  );

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response.responseData;
};
