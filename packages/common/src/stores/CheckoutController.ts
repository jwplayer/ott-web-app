import { inject, injectable } from 'inversify';

import type {
  AddAdyenPaymentDetailsResponse,
  AdyenPaymentSession,
  CardPaymentData,
  CreateOrderArgs,
  FinalizeAdyenPayment,
  FinalizeAdyenPaymentDetailsResponse,
  GetEntitlements,
  GetOffers,
  InitialAdyenPayment,
  Offer,
  Order,
  PaymentMethod,
  PaymentWithPayPalResponse,
  SwitchOffer,
  UpdateOrderPayload,
} from '../../types/checkout';
import CheckoutService from '../services/integrations/CheckoutService';
import SubscriptionService from '../services/integrations/SubscriptionService';
import type { IntegrationType } from '../../types/config';
import { assertModuleMethod, getNamedModule } from '../modules/container';
import { GET_CUSTOMER_IP, INTEGRATION_TYPE } from '../modules/types';
import type { GetCustomerIP } from '../../types/get-customer-ip';
import AccountService from '../services/integrations/AccountService';

import { useCheckoutStore } from './CheckoutStore';
import { useAccountStore } from './AccountStore';

@injectable()
export default class CheckoutController {
  private readonly accountService: AccountService;
  private readonly checkoutService: CheckoutService;
  private readonly subscriptionService: SubscriptionService;
  private readonly getCustomerIP: GetCustomerIP;

  constructor(@inject(INTEGRATION_TYPE) integrationType: IntegrationType, @inject(GET_CUSTOMER_IP) getCustomerIP: GetCustomerIP) {
    this.getCustomerIP = getCustomerIP;
    this.accountService = getNamedModule(AccountService, integrationType);
    this.checkoutService = getNamedModule(CheckoutService, integrationType);
    this.subscriptionService = getNamedModule(SubscriptionService, integrationType);
  }

  getSubscriptionOfferIds = () => {
    return this.accountService.svodOfferIds;
  };

  createOrder = async (offer: Offer, paymentMethodId?: number): Promise<void> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { customer } = getAccountInfo();

    const createOrderArgs: CreateOrderArgs = {
      offer,
      customerId: customer.id,
      country: customer?.country || '',
      paymentMethodId,
    };

    const response = await this.checkoutService.createOrder(createOrderArgs);

    if (response?.errors?.length > 0) {
      useCheckoutStore.getState().setOrder(null);

      throw new Error(response?.errors[0]);
    }

    useCheckoutStore.getState().setOrder(response.responseData?.order);
  };

  updateOrder = async (order: Order, paymentMethodId?: number, couponCode?: string | null): Promise<void> => {
    const updateOrderPayload: UpdateOrderPayload = {
      order,
      paymentMethodId,
      couponCode,
    };

    const response = await this.checkoutService.updateOrder(updateOrderPayload);
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
    const { paymentMethods } = useCheckoutStore.getState();

    if (paymentMethods) return paymentMethods; // already fetched payment methods

    const response = await this.checkoutService.getPaymentMethods();

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    useCheckoutStore.getState().setPaymentMethods(response.responseData?.paymentMethods);

    return response.responseData?.paymentMethods;
  };

  paymentWithoutDetails = async (): Promise<unknown> => {
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');

    const response = await this.checkoutService.paymentWithoutDetails({ orderId: order.id });

    if (response.errors.length > 0) throw new Error(response.errors[0]);
    if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

    return response.responseData;
  };

  directPostCardPayment = async (cardPaymentPayload: CardPaymentData, referrer: string, returnUrl: string): Promise<unknown> => {
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');

    return await this.checkoutService.directPostCardPayment(cardPaymentPayload, order, referrer, returnUrl);
  };

  createAdyenPaymentSession = async (returnUrl: string, isInitialPayment: boolean = true): Promise<AdyenPaymentSession> => {
    const { order } = useCheckoutStore.getState();
    const orderId = order?.id;

    if (isInitialPayment && !orderId) throw new Error('There is no order to pay for');

    assertModuleMethod(this.checkoutService.createAdyenPaymentSession, 'createAdyenPaymentSession is not available in checkout service');

    const response = await this.checkoutService.createAdyenPaymentSession({
      orderId: orderId,
      returnUrl: returnUrl,
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  initialAdyenPayment = async (paymentMethod: AdyenPaymentMethod, returnUrl: string): Promise<InitialAdyenPayment> => {
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');

    assertModuleMethod(this.checkoutService.initialAdyenPayment, 'initialAdyenPayment is not available in checkout service');

    const response = await this.checkoutService.initialAdyenPayment({
      orderId: order.id,
      returnUrl: returnUrl,
      paymentMethod,
      customerIP: await this.getCustomerIP(),
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  finalizeAdyenPayment = async (details: unknown, orderId?: number, paymentData?: string): Promise<FinalizeAdyenPayment> => {
    if (!orderId) throw new Error('No order created');

    assertModuleMethod(this.checkoutService.finalizeAdyenPayment, 'finalizeAdyenPayment is not available in checkout service');

    const response = await this.checkoutService.finalizeAdyenPayment({
      orderId,
      details,
      paymentData,
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  paypalPayment = async (
    successUrl: string,
    waitingUrl: string,
    cancelUrl: string,
    errorUrl: string,
    couponCode: string = '',
  ): Promise<PaymentWithPayPalResponse> => {
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');

    const response = await this.checkoutService.paymentWithPayPal({
      order: order,
      successUrl,
      waitingUrl,
      cancelUrl,
      errorUrl,
      couponCode,
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  getSubscriptionSwitches = async (): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();

    assertModuleMethod(this.checkoutService.getSubscriptionSwitches, 'getSubscriptionSwitches is not available in checkout service');
    assertModuleMethod(this.checkoutService.getOffer, 'getOffer is not available in checkout service');

    const { subscription } = useAccountStore.getState();

    if (!subscription) return;

    const response = await this.checkoutService.getSubscriptionSwitches({
      customerId: customerId,
      offerId: subscription.offerId,
    });

    if (!response.responseData.available.length) return;

    // create variable for `getOffer` to ensure it's typed in `Array#map` scope
    const getOfferDelegate = this.checkoutService.getOffer;
    const switchOffers = response.responseData.available.map((offer: SwitchOffer) => getOfferDelegate({ offerId: offer.toOfferId }));
    const offers = await Promise.all(switchOffers);

    // Sort offers for proper ordering in "Choose Offer" modal when applicable
    const offerSwitches = offers.sort((a, b) => a?.responseData.offerPrice - b?.responseData.offerPrice).map((item) => item.responseData);
    useCheckoutStore.setState({ offerSwitches });
  };

  switchSubscription = async (toOfferId: string, switchDirection: 'upgrade' | 'downgrade'): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();

    assertModuleMethod(this.checkoutService.switchSubscription, 'switchSubscription is not available in checkout service');

    const { subscription } = useAccountStore.getState();
    if (!subscription) return;

    const SwitchSubscriptionPayload = {
      toOfferId,
      customerId: customerId,
      offerId: subscription.offerId,
      switchDirection: switchDirection,
    };

    await this.checkoutService.switchSubscription(SwitchSubscriptionPayload);

    // clear current offers
    useCheckoutStore.setState({ offerSwitches: [] });
  };

  changeSubscription = async ({ accessFeeId, subscriptionId }: { accessFeeId: string; subscriptionId: string }) => {
    assertModuleMethod(this.subscriptionService.changeSubscription, 'changeSubscription is not available in subscription service');

    const { responseData } = await this.subscriptionService.changeSubscription({
      accessFeeId,
      subscriptionId,
    });

    return responseData;
  };

  updatePayPalPaymentMethod = async (
    successUrl: string,
    waitingUrl: string,
    cancelUrl: string,
    errorUrl: string,
    paymentMethodId: number,
    currentPaymentId?: number,
  ) => {
    assertModuleMethod(this.checkoutService.updatePaymentMethodWithPayPal, 'updatePaymentMethodWithPayPal is not available in checkout service');
    assertModuleMethod(this.checkoutService.deletePaymentMethod, 'deletePaymentMethod is not available in checkout service');

    const response = await this.checkoutService.updatePaymentMethodWithPayPal({
      paymentMethodId,
      successUrl,
      waitingUrl,
      cancelUrl,
      errorUrl,
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    if (currentPaymentId) {
      await this.checkoutService.deletePaymentMethod({ paymentDetailsId: currentPaymentId });
    }

    return response.responseData;
  };

  addAdyenPaymentDetails = async (paymentMethod: AdyenPaymentMethod, paymentMethodId: number, returnUrl: string): Promise<AddAdyenPaymentDetailsResponse> => {
    assertModuleMethod(this.checkoutService.addAdyenPaymentDetails, 'addAdyenPaymentDetails is not available in checkout service');

    const response = await this.checkoutService.addAdyenPaymentDetails({
      paymentMethodId,
      returnUrl,
      paymentMethod,
      customerIP: await this.getCustomerIP(),
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  finalizeAdyenPaymentDetails = async (details: unknown, paymentMethodId: number, paymentData?: string): Promise<FinalizeAdyenPaymentDetailsResponse> => {
    assertModuleMethod(this.checkoutService.finalizeAdyenPaymentDetails, 'finalizeAdyenPaymentDetails is not available in checkout service');

    const response = await this.checkoutService.finalizeAdyenPaymentDetails({
      paymentMethodId,
      details,
      paymentData,
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  getOffers: GetOffers = (payload) => {
    return this.checkoutService.getOffers(payload);
  };

  getEntitlements: GetEntitlements = (payload) => {
    return this.checkoutService.getEntitlements(payload);
  };
}
