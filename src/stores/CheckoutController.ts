import { inject, injectable } from 'inversify';

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
import { assertModuleMethod, getNamedModule } from '#src/modules/container';
import type { IntegrationType } from '#types/Config';

@injectable()
export default class CheckoutController {
  private readonly checkoutService: CheckoutService;
  private readonly subscriptionService: SubscriptionService;

  constructor(@inject('INTEGRATION_TYPE') integrationType: IntegrationType) {
    this.checkoutService = getNamedModule(CheckoutService, integrationType);
    this.subscriptionService = getNamedModule(SubscriptionService, integrationType);
  }

  createOrder = async (offer: Offer, paymentMethodId?: number): Promise<void> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    const { customer } = getAccountInfo();

    if (!authProviderId) throw new Error('auth provider is not configured');

    const createOrderArgs: CreateOrderArgs = {
      offer,
      customerId: customer.id,
      country: customer?.country || '',
      customerIP: customer?.lastUserIp || '',
      paymentMethodId,
    };

    const response = await this.checkoutService.createOrder(createOrderArgs, isSandbox);

    if (response?.errors?.length > 0) {
      useCheckoutStore.getState().setOrder(null);

      throw new Error(response?.errors[0]);
    }

    useCheckoutStore.getState().setOrder(response.responseData?.order);
  };

  updateOrder = async (order: Order, paymentMethodId?: number, couponCode?: string | null): Promise<void> => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    if (!authProviderId) throw new Error('auth provider is not configured');

    const updateOrderPayload: UpdateOrderPayload = {
      order,
      paymentMethodId,
      couponCode,
    };

    const response = await this.checkoutService.updateOrder(updateOrderPayload, isSandbox);
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
    const { isSandbox } = useConfigStore.getState();
    const { paymentMethods } = useCheckoutStore.getState();

    if (paymentMethods) return paymentMethods; // already fetched payment methods

    const response = await this.checkoutService.getPaymentMethods(isSandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    useCheckoutStore.getState().setPaymentMethods(response.responseData?.paymentMethods);

    return response.responseData?.paymentMethods;
  };

  paymentWithoutDetails = async (): Promise<unknown> => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');

    const response = await this.checkoutService.paymentWithoutDetails({ orderId: order.id }, isSandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);
    if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

    return response.responseData;
  };

  directPostCardPayment = async (cardPaymentPayload: CardPaymentData): Promise<unknown> => {
    const { clientId: authProviderId } = useConfigStore.getState();
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');

    return await this.checkoutService.directPostCardPayment(cardPaymentPayload, order);
  };

  createAdyenPaymentSession = async (returnUrl: string, isInitialPayment: boolean = true): Promise<AdyenPaymentSession> => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();
    const { order } = useCheckoutStore.getState();

    const orderId = order?.id;

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (isInitialPayment && !orderId) throw new Error('There is no order to pay for');

    assertModuleMethod(this.checkoutService.createAdyenPaymentSession, 'createAdyenPaymentSession is not available in checkout service');

    const response = await this.checkoutService.createAdyenPaymentSession(
      {
        orderId: orderId,
        returnUrl: returnUrl,
      },
      isSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  initialAdyenPayment = async (paymentMethod: AdyenPaymentMethod, returnUrl: string): Promise<InitialAdyenPayment> => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');

    assertModuleMethod(this.checkoutService.initialAdyenPayment, 'initialAdyenPayment is not available in checkout service');

    const response = await this.checkoutService.initialAdyenPayment(
      {
        orderId: order.id,
        returnUrl: returnUrl,
        paymentMethod,
        attemptAuthentication: isSandbox ? 'always' : undefined,
        customerIP: getOverrideIP(),
      },
      isSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  finalizeAdyenPayment = async (details: unknown, orderId?: number, paymentData?: string): Promise<FinalizeAdyenPayment> => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    if (!orderId) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');

    assertModuleMethod(this.checkoutService.finalizeAdyenPayment, 'finalizeAdyenPayment is not available in checkout service');

    const response = await this.checkoutService.finalizeAdyenPayment(
      {
        orderId,
        details,
        paymentData,
      },
      isSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  paypalPayment = async (successUrl: string, cancelUrl: string, errorUrl: string, couponCode: string = ''): Promise<PaymentWithPayPalResponse> => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();
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
      isSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  getSubscriptionSwitches = async (): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    const { customerId } = getAccountInfo();

    if (!authProviderId) throw new Error('auth provider is not configured');

    assertModuleMethod(this.checkoutService.getSubscriptionSwitches, 'getSubscriptionSwitches is not available in checkout service');
    assertModuleMethod(this.checkoutService.getOffer, 'getOffer is not available in checkout service');

    const { subscription } = useAccountStore.getState();

    if (!subscription) return;

    const response = await this.checkoutService.getSubscriptionSwitches(
      {
        customerId: customerId,
        offerId: subscription.offerId,
      },
      isSandbox,
    );

    if (!response.responseData.available.length) return;

    // @ts-expect-error we have checked the presence of the method
    const switchOffers = response.responseData.available.map((offer: SwitchOffer) => this.checkoutService.getOffer({ offerId: offer.toOfferId }, isSandbox));
    const offers = await Promise.all(switchOffers);

    // Sort offers for proper ordering in "Choose Offer" modal when applicable
    const offerSwitches = offers.sort((a, b) => a?.responseData.offerPrice - b?.responseData.offerPrice).map((item) => item.responseData);
    useCheckoutStore.setState({ offerSwitches });
  };

  switchSubscription = async (toOfferId: string, switchDirection: 'upgrade' | 'downgrade'): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    const { customerId } = getAccountInfo();

    if (!authProviderId) throw new Error('auth provider is not configured');

    assertModuleMethod(this.checkoutService.switchSubscription, 'switchSubscription is not available in checkout service');

    const { subscription } = useAccountStore.getState();
    if (!subscription) return;

    const SwitchSubscriptionPayload = {
      toOfferId,
      customerId: customerId,
      offerId: subscription.offerId,
      switchDirection: switchDirection,
    };

    await this.checkoutService.switchSubscription(SwitchSubscriptionPayload, isSandbox);

    // clear current offers
    useCheckoutStore.setState({ offerSwitches: [] });
  };

  changeSubscription = async ({ accessFeeId, subscriptionId }: { accessFeeId: string; subscriptionId: string }) => {
    const { isSandbox } = useConfigStore.getState();

    assertModuleMethod(this.subscriptionService.changeSubscription, 'changeSubscription is not available in subscription service');

    const { responseData } = await this.subscriptionService.changeSubscription(
      {
        accessFeeId,
        subscriptionId,
      },
      isSandbox,
    );

    return responseData;
  };

  updatePayPalPaymentMethod = async (successUrl: string, cancelUrl: string, errorUrl: string, paymentMethodId: number, currentPaymentId?: number) => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    if (!authProviderId) throw new Error('auth provider is not configured');

    assertModuleMethod(this.checkoutService.updatePaymentMethodWithPayPal, 'updatePaymentMethodWithPayPal is not available in checkout service');
    assertModuleMethod(this.checkoutService.deletePaymentMethod, 'deletePaymentMethod is not available in checkout service');

    const response = await this.checkoutService.updatePaymentMethodWithPayPal(
      {
        paymentMethodId,
        successUrl,
        cancelUrl,
        errorUrl,
      },
      isSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    if (currentPaymentId) {
      await this.checkoutService.deletePaymentMethod({ paymentDetailsId: currentPaymentId }, isSandbox);
    }

    return response.responseData;
  };

  addAdyenPaymentDetails = async (paymentMethod: AdyenPaymentMethod, paymentMethodId: number, returnUrl: string): Promise<AddAdyenPaymentDetailsResponse> => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    if (!authProviderId) throw new Error('auth provider is not configured');

    assertModuleMethod(this.checkoutService.addAdyenPaymentDetails, 'addAdyenPaymentDetails is not available in checkout service');

    const response = await this.checkoutService.addAdyenPaymentDetails(
      {
        paymentMethodId,
        returnUrl,
        paymentMethod,
        attemptAuthentication: isSandbox ? 'always' : undefined,
        customerIP: getOverrideIP(),
      },
      isSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  finalizeAdyenPaymentDetails = async (details: unknown, paymentMethodId: number, paymentData?: string): Promise<FinalizeAdyenPaymentDetails> => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    if (!authProviderId) throw new Error('auth provider is not configured');

    assertModuleMethod(this.checkoutService.finalizeAdyenPaymentDetails, 'finalizeAdyenPaymentDetails is not available in checkout service');

    const response = await this.checkoutService.finalizeAdyenPaymentDetails(
      {
        paymentMethodId,
        details,
        paymentData,
      },
      isSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  getOffers: GetOffers = (payload, sandbox) => {
    return this.checkoutService.getOffers(payload, sandbox);
  };

  getEntitlements: GetEntitlements = (payload, sandbox) => {
    return this.checkoutService.getEntitlements(payload, sandbox);
  };
}
