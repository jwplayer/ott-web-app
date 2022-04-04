import { Store } from 'pullstate';

import * as checkoutService from '../services/checkout.service';
import type { CreateOrderPayload, Offer, Order, PaymentMethod, UpdateOrderPayload } from '../../types/checkout';
import { getLocales } from '../services/account.service';

import { ConfigStore } from './ConfigStore';
import { AccountStore } from './AccountStore';

type CheckoutStore = {
  offer: Offer | null;
  order: Order | null;
  paymentMethods: PaymentMethod[] | null;
};

export const CheckoutStore = new Store<CheckoutStore>({
  offer: null,
  order: null,
  paymentMethods: null,
});

export const createOrder = async (offerId: string, paymentMethodId?: number) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { user, auth } = AccountStore.getRawState();

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
    CheckoutStore.update((s) => {
      s.order = null;
    });

    throw new Error(response.errors[0]);
  }

  CheckoutStore.update((s) => {
    s.order = response.responseData?.order;
  });
};

export const updateOrder = async (orderId: number, paymentMethodId?: number, couponCode?: string | null) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { user, auth } = AccountStore.getRawState();

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
      CheckoutStore.update((s) => {
        s.order = null;
      });
    }

    throw new Error(response.errors[0]);
  }

  CheckoutStore.update((s) => {
    s.order = response.responseData?.order;
  });
};

export const getPaymentMethods = async () => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { user, auth } = AccountStore.getRawState();
  const { paymentMethods } = CheckoutStore.getRawState();

  if (paymentMethods) return paymentMethods; // already fetched payment methods
  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const response = await checkoutService.getPaymentMethods(cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  CheckoutStore.update((s) => {
    s.paymentMethods = response.responseData?.paymentMethods;
  });

  return response.responseData?.paymentMethods;
};

export const paymentWithoutDetails = async () => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { user, auth } = AccountStore.getRawState();
  const { order } = CheckoutStore.getRawState();

  if (!order) throw new Error('No order created');
  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const response = await checkoutService.paymentWithoutDetails({ orderId: order.id }, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);
  if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

  return response.responseData;
};

export const adyenPayment = async (paymentMethod: AdyenPaymentMethod) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { user, auth } = AccountStore.getRawState();
  const { order } = CheckoutStore.getRawState();

  if (!order) throw new Error('No order created');
  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const response = await checkoutService.paymentWithAdyen({ orderId: order.id, card: paymentMethod }, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);
  if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

  return response.responseData;
};

export const paypalPayment = async (successUrl: string, cancelUrl: string, errorUrl: string) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { user, auth } = AccountStore.getRawState();
  const { order } = CheckoutStore.getRawState();

  if (!order) throw new Error('No order created');
  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const response = await checkoutService.paymentWithPayPal({ orderId: order.id, successUrl, cancelUrl, errorUrl }, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response.responseData;
};
