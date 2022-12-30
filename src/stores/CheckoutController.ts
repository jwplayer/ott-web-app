import type { CardPaymentData, CreateOrderArgs, Offer, Order, PaymentMethod, PaymentWithPayPalResponse, UpdateOrderPayload } from '#types/checkout';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import useAccount from '#src/hooks/useAccount';
import useService from '#src/hooks/useService';

export const createOrder = async (offer: Offer, paymentMethodId?: number): Promise<unknown> => {
  return await useAccount(async ({ customer, auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not configured');

      const createOrderArgs: CreateOrderArgs = {
        offer,
        customerId: customer.id,
        country: customer?.country || '',
        customerIP: customer?.lastUserIp || '',
        paymentMethodId,
      };

      const response = await checkoutService.createOrder(createOrderArgs, sandbox || true, jwt);

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
    return await useService(async ({ checkoutService, sandbox, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not configured');

      const updateOrderPayload: UpdateOrderPayload = {
        order,
        paymentMethodId,
        couponCode,
      };

      const response = await checkoutService?.updateOrder(updateOrderPayload, sandbox || true, jwt);
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
    return await useService(async ({ checkoutService, sandbox }) => {
      if (!checkoutService) throw new Error('checkout service is not configured');

      const { paymentMethods } = useCheckoutStore.getState();

      if (paymentMethods) return paymentMethods; // already fetched payment methods

      const response = await checkoutService?.getPaymentMethods(sandbox || true, jwt);

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      useCheckoutStore.getState().setPaymentMethods(response.responseData?.paymentMethods);

      return response.responseData?.paymentMethods;
    });
  });
};

export const paymentWithoutDetails = async (): Promise<unknown> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox, authProviderId }) => {
      if (!checkoutService) throw new Error('checkout service is not configured');

      const { order } = useCheckoutStore.getState();

      if (!order) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');

      const response = await checkoutService?.paymentWithoutDetails({ orderId: order.id }, sandbox || true, jwt);

      if (response.errors.length > 0) throw new Error(response.errors[0]);
      if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

      return response.responseData;
    });
  });
};

export const directPostCardPayment = async (cardPaymentPayload: CardPaymentData): Promise<unknown> => {
  return await useAccount(async () => {
    return await useService(async ({ checkoutService, authProviderId }) => {
      const { order } = useCheckoutStore.getState();

      if (!order) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');

      const response = await checkoutService?.directPostCardPayment(cardPaymentPayload, order);

      return response;
    });
  });
};

export const iFrameCardPayment = async (paymentMethod: AdyenPaymentMethod): Promise<unknown> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox, authProviderId }) => {
      const { order } = useCheckoutStore.getState();

      if (!order) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not configured');

      const response = await checkoutService?.iFrameCardPayment(
        {
          orderId: order.id,
          card: paymentMethod,
        },
        sandbox || true,
        jwt,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);
      if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

      return response.responseData;
    });
  });
};

export const paypalPayment = async (successUrl: string, cancelUrl: string, errorUrl: string): Promise<PaymentWithPayPalResponse> => {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox, authProviderId }) => {
      const { order } = useCheckoutStore.getState();

      if (!order) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not configured');

      const response = await checkoutService?.paymentWithPayPal(
        {
          order: order,
          successUrl,
          cancelUrl,
          errorUrl,
        },
        sandbox || true,
        jwt,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};
