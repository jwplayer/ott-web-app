import { Store } from 'pullstate';

import * as checkoutService from '../services/checkout.service';
import type { CreateOrderPayload, Offer, Order, UpdateOrderPayload } from '../../types/checkout';

import { ConfigStore } from './ConfigStore';
import { AccountStore } from './AccountStore';

type CheckoutStore = {
  offer: Offer | null;
  order: Order | null;
};

export const CheckoutStore = new Store<CheckoutStore>({
  offer: null,
  order: null,
});

export const createOrder = async (offerId: string, paymentMethodId?: number) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { user, auth } = AccountStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user is not logged in');

  const createOrderPayload: CreateOrderPayload = {
    offerId,
    customerId: user.id,
    country: user.country,
    currency: user.currency,
    customerIP: user.lastUserIp,
    paymentMethodId,
  };

  const response = await checkoutService.createOrder(createOrderPayload, cleengSandbox, auth.jwt);

  console.log(response);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  CheckoutStore.update(s => {
    s.order = response.responseData?.order;
  });
};

export const updateOrder = async (orderId: number, paymentMethodId?: number, couponCode?: string) => {
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

  console.log(response);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  CheckoutStore.update(s => {
    s.order = response.responseData?.order;
  });
};
