import { injectable } from 'inversify';

import { getOverrideIP } from '../utils/common';

import { useAccountStore } from '#src/stores/AccountStore';
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
  GetOffers,
  GetEntitlements,
} from '#types/checkout';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import CheckoutService from '#src/services/checkout.service';
import SubscriptionService from '#src/services/subscription.service';

@injectable()
export default class CheckoutController {
  private readonly checkoutService: CheckoutService;
  private readonly subscriptionService: SubscriptionService;

  constructor(checkoutService: CheckoutService, subscriptionService: SubscriptionService) {
    this.checkoutService = checkoutService;
    this.subscriptionService = subscriptionService;
  }

  createOrder = async (offer: Offer, paymentMethodId?: number): Promise<void> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    const { customer } = getAccountInfo();

    if (!authProviderId) throw new Error('auth provider is not configured');

    const createOrderArgs: CreateOrderArgs = {
      offer,
      customerId: customer.id,
      country: customer?.country || '',
      customerIP: customer?.lastUserIp || '',
      paymentMethodId,
    };

    const response = await this.checkoutService.createOrder(createOrderArgs, useSandbox);

    if (response?.errors?.length > 0) {
      useCheckoutStore.getState().setOrder(null);

      throw new Error(response?.errors[0]);
    }

    useCheckoutStore.getState().setOrder(response.responseData?.order);
  };

  updateOrder = async (order: Order, paymentMethodId?: number, couponCode?: string | null): Promise<void> => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    if (!authProviderId) throw new Error('auth provider is not configured');

    const updateOrderPayload: UpdateOrderPayload = {
      order,
      paymentMethodId,
      couponCode,
    };

    const response = await this.checkoutService.updateOrder(updateOrderPayload, useSandbox);
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
  };

  getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const { useSandbox } = this.getIntegration();
    const { paymentMethods } = useCheckoutStore.getState();

    if (paymentMethods) return paymentMethods; // already fetched payment methods

    const response = await this.checkoutService.getPaymentMethods(useSandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    useCheckoutStore.getState().setPaymentMethods(response.responseData?.paymentMethods);

    return response.responseData?.paymentMethods;
  };

  paymentWithoutDetails = async (): Promise<unknown> => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');

    const response = await this.checkoutService.paymentWithoutDetails({ orderId: order.id }, useSandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);
    if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

    return response.responseData;
  };

  directPostCardPayment = async (cardPaymentPayload: CardPaymentData): Promise<unknown> => {
    const { clientId: authProviderId } = this.getIntegration();
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');

    return await this.checkoutService.directPostCardPayment(cardPaymentPayload, order);
  };

  createAdyenPaymentSession = async (returnUrl: string, isInitialPayment: boolean = true): Promise<AdyenPaymentSession> => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();
    const { order } = useCheckoutStore.getState();

    const orderId = order?.id;

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (isInitialPayment && !orderId) throw new Error('There is no order to pay for');
    if (typeof this.checkoutService.createAdyenPaymentSession === 'undefined') {
      throw new Error('createAdyenPaymentSession is not available in checkout service');
    }

    const response = await this.checkoutService.createAdyenPaymentSession(
      {
        orderId: orderId,
        returnUrl: returnUrl,
      },
      useSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  initialAdyenPayment = async (paymentMethod: AdyenPaymentMethod, returnUrl: string): Promise<InitialAdyenPayment> => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');
    if (typeof this.checkoutService.initialAdyenPayment === 'undefined') {
      throw new Error('initialAdyenPayment is not available in checkout service');
    }

    const response = await this.checkoutService.initialAdyenPayment(
      {
        orderId: order.id,
        returnUrl: returnUrl,
        paymentMethod,
        attemptAuthentication: useSandbox ? 'always' : undefined,
        customerIP: getOverrideIP(),
      },
      useSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  finalizeAdyenPayment = async (details: unknown, orderId?: number, paymentData?: string): Promise<FinalizeAdyenPayment> => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    if (!orderId) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');
    if (typeof this.checkoutService.finalizeAdyenPayment === 'undefined') {
      throw new Error('finalizeAdyenPayment is not available in checkout service');
    }

    const response = await this.checkoutService.finalizeAdyenPayment(
      {
        orderId,
        details,
        paymentData,
      },
      useSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  paypalPayment = async (successUrl: string, cancelUrl: string, errorUrl: string, couponCode: string = ''): Promise<PaymentWithPayPalResponse> => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');

    const response = await this.checkoutService.paymentWithPayPal(
      {
        order: order,
        successUrl,
        cancelUrl,
        errorUrl,
        couponCode,
      },
      useSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  getSubscriptionSwitches = async (): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    const { customerId } = getAccountInfo();

    if (!authProviderId) throw new Error('auth provider is not configured');

    if (typeof this.checkoutService.getSubscriptionSwitches === 'undefined') {
      throw new Error('getSubscriptionSwitches is not available in checkout service');
    }

    if (typeof this.checkoutService.getOffer === 'undefined') {
      throw new Error('getOffer is not available in checkout service');
    }

    const { subscription } = useAccountStore.getState();

    if (!subscription) return;

    const response = await this.checkoutService.getSubscriptionSwitches(
      {
        customerId: customerId,
        offerId: subscription.offerId,
      },
      useSandbox,
    );

    if (!response.responseData.available.length) return;

    // @ts-expect-error we have checked the presence of the method
    const switchOffers = response.responseData.available.map((offer: SwitchOffer) => this.checkoutService.getOffer({ offerId: offer.toOfferId }, useSandbox));
    const offers = await Promise.all(switchOffers);

    // Sort offers for proper ordering in "Choose Offer" modal when applicable
    const offerSwitches = offers.sort((a, b) => a?.responseData.offerPrice - b?.responseData.offerPrice).map((item) => item.responseData);
    useCheckoutStore.setState({ offerSwitches });
  };

  switchSubscription = async (toOfferId: string, switchDirection: 'upgrade' | 'downgrade'): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    const { customerId } = getAccountInfo();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (typeof this.checkoutService.switchSubscription === 'undefined') {
      throw new Error('switchSubscription is not available in checkout service');
    }

    const { subscription } = useAccountStore.getState();
    if (!subscription) return;

    const SwitchSubscriptionPayload = { toOfferId, customerId: customerId, offerId: subscription.offerId, switchDirection: switchDirection };

    await this.checkoutService.switchSubscription(SwitchSubscriptionPayload, useSandbox);

    // clear current offers
    useCheckoutStore.setState({ offerSwitches: [] });
  };

  changeSubscription = async ({ accessFeeId, subscriptionId }: { accessFeeId: string; subscriptionId: string }) => {
    const { useSandbox } = this.getIntegration();

    if (typeof this.subscriptionService.changeSubscription === 'undefined') {
      throw new Error('changeSubscription is not available in subscription service');
    }

    const { responseData } = await this.subscriptionService.changeSubscription({ accessFeeId, subscriptionId }, useSandbox);

    return responseData;
  };

  updatePayPalPaymentMethod = async (successUrl: string, cancelUrl: string, errorUrl: string, paymentMethodId: number, currentPaymentId?: number) => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    if (!authProviderId) throw new Error('auth provider is not configured');

    if (typeof this.checkoutService.updatePaymentMethodWithPayPal === 'undefined') {
      throw new Error('updatePaymentMethodWithPayPal is not available in checkout service');
    }
    if (typeof this.checkoutService.deletePaymentMethod === 'undefined') {
      throw new Error('deletePaymentMethod is not available in checkout service');
    }

    const response = await this.checkoutService.updatePaymentMethodWithPayPal(
      {
        paymentMethodId,
        successUrl,
        cancelUrl,
        errorUrl,
      },
      useSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    if (currentPaymentId) {
      await this.checkoutService.deletePaymentMethod({ paymentDetailsId: currentPaymentId }, useSandbox);
    }

    return response.responseData;
  };

  addAdyenPaymentDetails = async (paymentMethod: AdyenPaymentMethod, paymentMethodId: number, returnUrl: string): Promise<AddAdyenPaymentDetailsResponse> => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (typeof this.checkoutService.addAdyenPaymentDetails === 'undefined') {
      throw new Error('addAdyenPaymentDetails is not available in checkout service');
    }

    const response = await this.checkoutService.addAdyenPaymentDetails(
      {
        paymentMethodId,
        returnUrl,
        paymentMethod,
        attemptAuthentication: useSandbox ? 'always' : undefined,
        customerIP: getOverrideIP(),
      },
      useSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  finalizeAdyenPaymentDetails = async (details: unknown, paymentMethodId: number, paymentData?: string): Promise<FinalizeAdyenPaymentDetails> => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (typeof this.checkoutService.finalizeAdyenPaymentDetails === 'undefined') {
      throw new Error('finalizeAddedAdyenPaymentDetails is not available in checkout service');
    }

    const response = await this.checkoutService.finalizeAdyenPaymentDetails({ paymentMethodId, details, paymentData }, useSandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  getOffers: GetOffers = (payload, sandbox) => {
    return this.checkoutService.getOffers(payload, sandbox);
  };

  getEntitlements: GetEntitlements = (payload, sandbox) => {
    return this.checkoutService.getEntitlements(payload, sandbox);
  };

  private getIntegration = () => {
    return useConfigStore.getState().getIntegration() ?? true;
  };
}
