import { getOverrideIP } from '../utils/common';

import { subscribeToNotifications } from './NotificationsController';

import type {
  AddAdyenPaymentDetailsResponse,
  AdyenPaymentSession,
  CardPaymentData,
  CreateOrderArgs,
  FinalizeAdyenPaymentDetails,
  FinalizeAdyenPayment,
  InitialAdyenPayment,
  Offer,
  Order,
  PaymentMethod,
  PaymentWithPayPalResponse,
  UpdateOrderPayload,
} from '#types/checkout';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import useAccount from '#src/hooks/useAccount';
import useService from '#src/hooks/useService';

export const createOrder = async (offer: Offer, paymentMethodId?: number): Promise<unknown> => {
  return await useAccount(async ({ customer, auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');

      const createOrderArgs: CreateOrderArgs = {
        offer,
        customerId: customer.id,
        country: customer?.country || '',
        customerIP: customer?.lastUserIp || '',
        paymentMethodId,
      };

      const response = await checkoutService.createOrder(createOrderArgs, sandbox, jwt);

      if (response?.errors?.length > 0) {
        useCheckoutStore.getState().setOrder(null);

        throw new Error(response?.errors[0]);
      }

      useCheckoutStore.getState().setOrder(response.responseData?.order);
    });
  });
};

export const updateOrder = async (order: Order, paymentMethodId?: number, couponCode?: string | null): Promise<unknown> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');

      const updateOrderPayload: UpdateOrderPayload = {
        order,
        paymentMethodId,
        couponCode,
      };

      const response = await checkoutService.updateOrder(updateOrderPayload, sandbox, jwt);

      if (response.errors.length > 0) {
        // clear the order when the order doesn't exist on the server
        if (response.errors[0].includes(`Order with ${order.id} not found`)) {
          useCheckoutStore.getState().setOrder(null);
        }

        throw new Error(response.errors[0]);
      }

      if (response.responseData?.order) {
        useCheckoutStore.getState().setOrder(response.responseData?.order);
      }
    });
  });
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true }) => {
      if (!checkoutService) throw new Error('checkout service is not available');

      const { paymentMethods } = useCheckoutStore.getState();

      if (paymentMethods) return paymentMethods; // already fetched payment methods

      const response = await checkoutService.getPaymentMethods(sandbox, jwt);

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      useCheckoutStore.getState().setPaymentMethods(response.responseData?.paymentMethods);

      return response.responseData?.paymentMethods;
    });
  });
};

export const paymentWithoutDetails = async (): Promise<unknown> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!checkoutService) throw new Error('checkout service is not available');

      const { order } = useCheckoutStore.getState();

      if (!order) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');

      const response = await checkoutService.paymentWithoutDetails({ orderId: order.id }, sandbox, jwt);

      if (response.errors.length > 0) throw new Error(response.errors[0]);
      if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

      return response.responseData;
    });
  });
};

export const directPostCardPayment = async (cardPaymentPayload: CardPaymentData): Promise<unknown> => {
  return await useAccount(async ({ customer }) => {
    return await useService(async ({ checkoutService, authProviderId }) => {
      const { order } = useCheckoutStore.getState();

      if (!order) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');

      // subscribe to listen to inplayer websocket notifications
      await subscribeToNotifications(customer?.uuid);

      const response = await checkoutService.directPostCardPayment(cardPaymentPayload, order);

      return response;
    });
  });
};

export const createAdyenPaymentSession = async (returnUrl: string, isInitialPayment: boolean = true): Promise<AdyenPaymentSession> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      const { order } = useCheckoutStore.getState();

      const getOrderIdIfInitialPayment = () => {
        if (!isInitialPayment) return undefined;

        if (!order) {
          throw new Error('No order created');
        }

        return order.id;
      };

      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('createAdyenPaymentSession' in checkoutService)) throw new Error('createAdyenPaymentSession is not available in checkout service');

      const response = await checkoutService.createAdyenPaymentSession(
        {
          orderId: getOrderIdIfInitialPayment(),
          returnUrl: returnUrl,
        },
        sandbox,
        jwt,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const initialAdyenPayment = async (
  paymentMethod: AdyenPaymentMethod,
  returnUrl: string,
  // billingAddress?: InitialAdyenPaymentPayload['billingAddress'],
): Promise<InitialAdyenPayment> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      const { order } = useCheckoutStore.getState();

      if (!order) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('initialAdyenPayment' in checkoutService)) throw new Error('initialAdyenPayment is not available in checkout service');

      const response = await checkoutService.initialAdyenPayment(
        {
          orderId: order.id,
          returnUrl: returnUrl,
          paymentMethod,
          attemptAuthentication: sandbox ? 'always' : undefined,
          customerIP: getOverrideIP(),
        },
        sandbox,
        jwt,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const finalizeAdyenPayment = async (details: unknown, orderId?: number, paymentData?: string): Promise<FinalizeAdyenPayment> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!orderId) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('initialAdyenPayment' in checkoutService)) throw new Error('finalizeAdyenPayment is not available in checkout service');

      const response = await checkoutService.finalizeAdyenPayment(
        {
          orderId,
          details,
          paymentData,
        },
        sandbox,
        jwt,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const paypalPayment = async (successUrl: string, cancelUrl: string, errorUrl: string, couponCode: string = ''): Promise<PaymentWithPayPalResponse> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      const { order } = useCheckoutStore.getState();

      if (!order) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');

      const response = await checkoutService.paymentWithPayPal(
        {
          order: order,
          successUrl,
          cancelUrl,
          errorUrl,
          couponCode,
        },
        sandbox,
        jwt,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const updatePaypalPaymentMethod = async (
  successUrl: string,
  cancelUrl: string,
  errorUrl: string,
  paymentMethodId: number,
  currentPaymentId?: number,
) => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('updatePaymentMethodWithPaypal' in checkoutService)) throw new Error('updatePaymentMethodWithPaypal is not available in checkout service');

      const response = await checkoutService.updatePaymentMethodWithPaypal(
        {
          paymentMethodId,
          successUrl,
          cancelUrl,
          errorUrl,
        },
        sandbox,
        jwt,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      if (currentPaymentId) {
        await checkoutService.deletePaymentMethod({ paymentDetailsId: currentPaymentId }, sandbox, jwt);
      }

      return response.responseData;
    });
  });
};

export const addAdyenPaymentDetails = async (
  paymentMethod: AdyenPaymentMethod,
  paymentMethodId: number,
  returnUrl: string,
): Promise<AddAdyenPaymentDetailsResponse> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('addAdyenPaymentDetails' in checkoutService)) throw new Error('addAdyenPaymentDetails is not available in checkout service');

      const response = await checkoutService.addAdyenPaymentDetails(
        {
          paymentMethodId,
          returnUrl,
          paymentMethod,
          attemptAuthentication: sandbox ? 'always' : undefined,
          customerIP: getOverrideIP(),
        },
        sandbox,
        jwt,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const finalizeAdyenPaymentDetails = async (details: unknown, paymentMethodId: number, paymentData?: string): Promise<FinalizeAdyenPaymentDetails> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('initialAdyenPayment' in checkoutService)) throw new Error('finalizeAddedAdyenPaymentDetails is not available in checkout service');

      const response = await checkoutService.finalizeAdyenPaymentDetails({ paymentMethodId, details, paymentData }, sandbox, jwt);

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};
