import { getOverrideIP } from '../utils/common';

import { useAccountStore } from './AccountStore';
import { reloadActiveSubscription } from './AccountController';

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
  SwitchOffer,
} from '#types/checkout';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import useAccount from '#src/hooks/useAccount';
import useService from '#src/hooks/useService';

export const createOrder = async (offer: Offer, paymentMethodId?: number): Promise<unknown> => {
  return await useAccount(async ({ customer }) => {
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

      const response = await checkoutService.createOrder(createOrderArgs, sandbox);

      if (response?.errors?.length > 0) {
        useCheckoutStore.getState().setOrder(null);

        throw new Error(response?.errors[0]);
      }

      useCheckoutStore.getState().setOrder(response.responseData?.order);
    });
  });
};

export const updateOrder = async (order: Order, paymentMethodId?: number, couponCode?: string | null): Promise<unknown> => {
  return await useAccount(async () => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');

      const updateOrderPayload: UpdateOrderPayload = {
        order,
        paymentMethodId,
        couponCode,
      };

      const response = await checkoutService.updateOrder(updateOrderPayload, sandbox);
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
  return await useAccount(async () => {
    return await useService(async ({ checkoutService, sandbox = true }) => {
      if (!checkoutService) throw new Error('checkout service is not available');

      const { paymentMethods } = useCheckoutStore.getState();

      if (paymentMethods) return paymentMethods; // already fetched payment methods

      const response = await checkoutService.getPaymentMethods(sandbox);

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      useCheckoutStore.getState().setPaymentMethods(response.responseData?.paymentMethods);

      return response.responseData?.paymentMethods;
    });
  });
};

export const paymentWithoutDetails = async (): Promise<unknown> => {
  return await useAccount(async () => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!checkoutService) throw new Error('checkout service is not available');

      const { order } = useCheckoutStore.getState();

      if (!order) throw new Error('No order created');
      if (!authProviderId) throw new Error('auth provider is not configured');

      const response = await checkoutService.paymentWithoutDetails({ orderId: order.id }, sandbox);

      if (response.errors.length > 0) throw new Error(response.errors[0]);
      if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

      return response.responseData;
    });
  });
};

export const directPostCardPayment = async (cardPaymentPayload: CardPaymentData): Promise<unknown> => {
  return await useService(async ({ checkoutService, authProviderId }) => {
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!checkoutService) throw new Error('checkout service is not available');

    return await checkoutService.directPostCardPayment(cardPaymentPayload, order);
  });
};

export const createAdyenPaymentSession = async (returnUrl: string, isInitialPayment: boolean = true): Promise<AdyenPaymentSession> => {
  return await useAccount(async () => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      const { order } = useCheckoutStore.getState();

      const orderId = order?.id;

      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (isInitialPayment && !orderId) throw new Error('There is no order to pay for');
      if (!('createAdyenPaymentSession' in checkoutService)) throw new Error('createAdyenPaymentSession is not available in checkout service');

      const response = await checkoutService.createAdyenPaymentSession(
        {
          orderId: orderId,
          returnUrl: returnUrl,
        },
        sandbox,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const initialAdyenPayment = async (paymentMethod: AdyenPaymentMethod, returnUrl: string): Promise<InitialAdyenPayment> => {
  return await useAccount(async () => {
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
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const finalizeAdyenPayment = async (details: unknown, orderId?: number, paymentData?: string): Promise<FinalizeAdyenPayment> => {
  return await useAccount(async () => {
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
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const paypalPayment = async (successUrl: string, cancelUrl: string, errorUrl: string, couponCode: string = ''): Promise<PaymentWithPayPalResponse> => {
  return await useAccount(async () => {
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
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const getSubscriptionSwitches = async (): Promise<unknown> => {
  return await useAccount(async ({ customerId }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('getSubscriptionSwitches' in checkoutService)) return;
      const { subscription } = useAccountStore.getState();

      if (!subscription) return;

      const response = await checkoutService.getSubscriptionSwitches(
        {
          customerId: customerId,
          offerId: subscription.offerId,
        },
        sandbox,
      );

      if (!response.responseData.available.length) return;

      const switchOffers = response.responseData.available.map((offer: SwitchOffer) => checkoutService.getOffer({ offerId: offer.toOfferId }, sandbox));
      const offers = await Promise.all(switchOffers);

      // Sort offers for proper ordering in "Choose Offer" modal when applicable
      const offerSwitches = offers.sort((a, b) => a?.responseData.offerPrice - b?.responseData.offerPrice).map((item) => item.responseData);
      useCheckoutStore.setState({ offerSwitches });
    });
  });
};

export const switchSubscription = async (toOfferId: string, switchDirection: 'upgrade' | 'downgrade'): Promise<unknown> => {
  return await useAccount(async ({ customerId }) => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('switchSubscription' in checkoutService)) throw new Error('SwitchSubscription not supported');
      const { subscription } = useAccountStore.getState();

      if (!subscription) return;

      const SwitchSubscriptionPayload = { toOfferId, customerId: customerId, offerId: subscription.offerId, switchDirection: switchDirection };

      await checkoutService.switchSubscription(SwitchSubscriptionPayload, sandbox);

      // switching a subscription takes a bit longer to process
      await reloadActiveSubscription({ delay: 7500 });

      // clear current offers
      useCheckoutStore.setState({ offerSwitches: [] });
    });
  });
};

export const changeSubscription = async ({ accessFeeId, subscriptionId }: { accessFeeId: string; subscriptionId: string }) => {
  return await useService(async ({ subscriptionService, sandbox = true }) => {
    if (!subscriptionService || !('changeSubscription' in subscriptionService)) throw new Error('subscription service is not configured');

    const { responseData } = await subscriptionService.changeSubscription({ accessFeeId, subscriptionId }, sandbox);

    return responseData;
  });
};

export const updatePayPalPaymentMethod = async (
  successUrl: string,
  cancelUrl: string,
  errorUrl: string,
  paymentMethodId: number,
  currentPaymentId?: number,
) => {
  return await useAccount(async () => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('updatePaymentMethodWithPayPal' in checkoutService)) throw new Error('updatePaymentMethodWithPayPal is not available in checkout service');

      const response = await checkoutService.updatePaymentMethodWithPayPal(
        {
          paymentMethodId,
          successUrl,
          cancelUrl,
          errorUrl,
        },
        sandbox,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      if (currentPaymentId) {
        await checkoutService.deletePaymentMethod({ paymentDetailsId: currentPaymentId }, sandbox);
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
  return await useAccount(async () => {
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
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};

export const finalizeAdyenPaymentDetails = async (details: unknown, paymentMethodId: number, paymentData?: string): Promise<FinalizeAdyenPaymentDetails> => {
  return await useAccount(async () => {
    return await useService(async ({ checkoutService, sandbox = true, authProviderId }) => {
      if (!authProviderId) throw new Error('auth provider is not configured');
      if (!checkoutService) throw new Error('checkout service is not available');
      if (!('initialAdyenPayment' in checkoutService)) throw new Error('finalizeAddedAdyenPaymentDetails is not available in checkout service');

      const response = await checkoutService.finalizeAdyenPaymentDetails({ paymentMethodId, details, paymentData }, sandbox);

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      return response.responseData;
    });
  });
};
