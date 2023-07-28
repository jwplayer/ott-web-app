import { inject, injectable } from 'inversify';

import { getOverrideIP } from '../utils/common';

import AccountController from './AccountController';

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
import { CONTROLLERS, SERVICES } from '#src/ioc/types';
import type CheckoutService from '#src/services/checkout/checkout.service';
import { useConfigStore } from '#src/stores/ConfigStore';
import type SubscriptionService from '#src/services/subscription/subscription.service';

@injectable()
export default class CheckoutController {
  private checkoutService: CheckoutService;
  private subscriptionService: SubscriptionService;
  private accountController: AccountController;

  constructor(
    @inject(SERVICES.Checkout) checkoutService: CheckoutService,
    @inject(SERVICES.Subscription) subscriptionService: SubscriptionService,
    @inject(CONTROLLERS.Account) accountController: AccountController,
  ) {
    this.checkoutService = checkoutService;
    this.subscriptionService = subscriptionService;
    this.accountController = accountController;
  }

  createOrder = async (offer: Offer, paymentMethodId?: number): Promise<void> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const { customer } = getAccountInfo();
    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');

    const createOrderArgs: CreateOrderArgs = {
      offer,
      customerId: customer.id,
      country: customer?.country || '',
      customerIP: customer?.lastUserIp || '',
      paymentMethodId,
    };

    const response = await this.checkoutService.createOrder(createOrderArgs, sandbox);

    if (response?.errors?.length > 0) {
      useCheckoutStore.getState().setOrder(null);

      throw new Error(response?.errors[0]);
    }

    useCheckoutStore.getState().setOrder(response.responseData?.order);
  };

  updateOrder = async (order: Order, paymentMethodId?: number, couponCode?: string | null): Promise<void> => {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');

    const updateOrderPayload: UpdateOrderPayload = {
      order,
      paymentMethodId,
      couponCode,
    };

    const response = await this.checkoutService.updateOrder(updateOrderPayload, sandbox);
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
    const { getSandbox } = useConfigStore.getState();

    const sandbox = getSandbox();

    if (!this.checkoutService) throw new Error('checkout service is not available');

    const { paymentMethods } = useCheckoutStore.getState();

    if (paymentMethods) return paymentMethods; // already fetched payment methods

    const response = await this.checkoutService.getPaymentMethods(sandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    useCheckoutStore.getState().setPaymentMethods(response.responseData?.paymentMethods);

    return response.responseData?.paymentMethods;
  };

  paymentWithoutDetails = async (): Promise<unknown> => {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    if (!this.checkoutService) throw new Error('checkout service is not available');

    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');

    const response = await this.checkoutService.paymentWithoutDetails({ orderId: order.id }, sandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);
    if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

    return response.responseData;
  };

  directPostCardPayment = async (cardPaymentPayload: CardPaymentData): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { getAuthProvider } = useConfigStore.getState();

    const { customer } = getAccountInfo();
    const authProviderId = getAuthProvider();

    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');

    // subscribe to listen to inplayer websocket notifications
    await this.accountController.subscribeToNotifications(customer?.uuid);

    return await this.checkoutService.directPostCardPayment(cardPaymentPayload, order);
  };

  createAdyenPaymentSession = async (returnUrl: string, isInitialPayment: boolean = true): Promise<AdyenPaymentSession> => {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    const { order } = useCheckoutStore.getState();

    const orderId = order?.id;

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');
    if (isInitialPayment && !orderId) throw new Error('There is no order to pay for');
    if (!('createAdyenPaymentSession' in this.checkoutService)) throw new Error('createAdyenPaymentSession is not available in checkout service');

    const response = await this.checkoutService.createAdyenPaymentSession(
      {
        orderId: orderId,
        returnUrl: returnUrl,
      },
      sandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  initialAdyenPayment = async (paymentMethod: AdyenPaymentMethod, returnUrl: string): Promise<InitialAdyenPayment> => {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');
    if (!('initialAdyenPayment' in this.checkoutService)) throw new Error('initialAdyenPayment is not available in checkout service');

    const response = await this.checkoutService.initialAdyenPayment(
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
  };

  finalizeAdyenPayment = async (details: unknown, orderId?: number, paymentData?: string): Promise<FinalizeAdyenPayment> => {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    if (!orderId) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');
    if (!('initialAdyenPayment' in this.checkoutService)) throw new Error('finalizeAdyenPayment is not available in checkout service');

    const response = await this.checkoutService.finalizeAdyenPayment(
      {
        orderId,
        details,
        paymentData,
      },
      sandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  paypalPayment = async (successUrl: string, cancelUrl: string, errorUrl: string, couponCode: string = ''): Promise<PaymentWithPayPalResponse> => {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');
    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');

    const response = await this.checkoutService.paymentWithPayPal(
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
  };

  getSubscriptionSwitches = async (): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const { customerId } = getAccountInfo();
    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');
    if (!('getSubscriptionSwitches' in this.checkoutService)) return;
    const { subscription } = useAccountStore.getState();

    if (!subscription) return;

    const response = await this.checkoutService.getSubscriptionSwitches(
      {
        customerId: customerId,
        offerId: subscription.offerId,
      },
      sandbox,
    );

    if (!response.responseData.available.length) return;

    const switchOffers = response.responseData.available.map((offer: SwitchOffer) => this.checkoutService.getOffer({ offerId: offer.toOfferId }, sandbox));
    const offers = await Promise.all(switchOffers);

    // Sort offers for proper ordering in "Choose Offer" modal when applicable
    const offerSwitches = offers.sort((a, b) => a?.responseData.offerPrice - b?.responseData.offerPrice).map((item) => item.responseData);
    useCheckoutStore.setState({ offerSwitches });
  };

  switchSubscription = async (toOfferId: string, switchDirection: 'upgrade' | 'downgrade'): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const { customerId } = getAccountInfo();
    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');
    if (!('switchSubscription' in this.checkoutService)) throw new Error('SwitchSubscription not supported');
    const { subscription } = useAccountStore.getState();

    if (!subscription) return;

    const SwitchSubscriptionPayload = { toOfferId, customerId: customerId, offerId: subscription.offerId, switchDirection: switchDirection };

    await this.checkoutService.switchSubscription(SwitchSubscriptionPayload, sandbox);

    // switching a subscription takes a bit longer to process
    await this.accountController.reloadActiveSubscription({ delay: 7500 });

    // clear current offers
    useCheckoutStore.setState({ offerSwitches: [] });
  };

  changeSubscription = async ({ accessFeeId, subscriptionId }: { accessFeeId: string; subscriptionId: string }) => {
    const { getSandbox } = useConfigStore.getState();

    const sandbox = getSandbox();

    if (!this.subscriptionService || !('changeSubscription' in this.subscriptionService)) throw new Error('subscription service is not configured');

    const { responseData } = await this.subscriptionService.changeSubscription({ accessFeeId, subscriptionId }, sandbox);

    return responseData;
  };

  updatePayPalPaymentMethod = async (successUrl: string, cancelUrl: string, errorUrl: string, paymentMethodId: number, currentPaymentId?: number) => {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');
    if (!('updatePaymentMethodWithPayPal' in this.checkoutService)) throw new Error('updatePaymentMethodWithPayPal is not available in checkout service');

    const response = await this.checkoutService.updatePaymentMethodWithPayPal(
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
      await this.checkoutService.deletePaymentMethod({ paymentDetailsId: currentPaymentId }, sandbox);
    }

    return response.responseData;
  };

  addAdyenPaymentDetails = async (paymentMethod: AdyenPaymentMethod, paymentMethodId: number, returnUrl: string): Promise<AddAdyenPaymentDetailsResponse> => {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');
    if (!('addAdyenPaymentDetails' in this.checkoutService)) throw new Error('addAdyenPaymentDetails is not available in checkout service');

    const response = await this.checkoutService.addAdyenPaymentDetails(
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
  };

  finalizeAdyenPaymentDetails = async (details: unknown, paymentMethodId: number, paymentData?: string): Promise<FinalizeAdyenPaymentDetails> => {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();

    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    if (!authProviderId) throw new Error('auth provider is not configured');
    if (!this.checkoutService) throw new Error('checkout service is not available');
    if (!('initialAdyenPayment' in this.checkoutService)) throw new Error('finalizeAddedAdyenPaymentDetails is not available in checkout service');

    const response = await this.checkoutService.finalizeAdyenPaymentDetails({ paymentMethodId, details, paymentData }, sandbox);

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
