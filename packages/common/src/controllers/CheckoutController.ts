import { inject, injectable } from 'inversify';
import i18next from 'i18next';

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
  Payment,
  PaymentMethod,
} from '../../types/checkout';
import CheckoutService from '../services/integrations/CheckoutService';
import SubscriptionService from '../services/integrations/SubscriptionService';
import type { IntegrationType } from '../../types/config';
import { assertModuleMethod, getNamedModule } from '../modules/container';
import { GET_CUSTOMER_IP, INTEGRATION_TYPE } from '../modules/types';
import type { GetCustomerIP } from '../../types/get-customer-ip';
import AccountService from '../services/integrations/AccountService';
import { useCheckoutStore } from '../stores/CheckoutStore';
import { useAccountStore } from '../stores/AccountStore';
import { FormValidationError } from '../errors/FormValidationError';
import { determineSwitchDirection } from '../utils/subscription';

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

  initialiseOffers = async () => {
    const requestedMediaOffers = useCheckoutStore.getState().requestedMediaOffers;
    const mediaOffers = requestedMediaOffers ? await this.getOffers({ offerIds: requestedMediaOffers.map(({ offerId }) => offerId) }) : [];
    useCheckoutStore.setState({ mediaOffers });

    if (!useCheckoutStore.getState().subscriptionOffers.length && this.accountService.svodOfferIds) {
      const subscriptionOffers = await this.getOffers({ offerIds: this.accountService.svodOfferIds });
      useCheckoutStore.setState({ subscriptionOffers });
    }

    if (!useCheckoutStore.getState().switchSubscriptionOffers.length) {
      const subscriptionSwitches = await this.getSubscriptionSwitches();
      const switchSubscriptionOffers = subscriptionSwitches ? await this.getOffers({ offerIds: subscriptionSwitches }) : [];
      useCheckoutStore.setState({ switchSubscriptionOffers });
    }
  };

  getSubscriptionOfferIds = () => this.accountService.svodOfferIds;

  chooseOffer = async (selectedOffer: Offer) => {
    useCheckoutStore.setState({ selectedOffer });
  };

  initialiseOrder = async (offer: Offer): Promise<void> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { customer } = getAccountInfo();

    const paymentMethods = await this.getPaymentMethods();
    const paymentMethodId = paymentMethods[0]?.id;

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
    let response;

    try {
      response = await this.checkoutService.updateOrder({ order, paymentMethodId, couponCode });
    } catch (error: unknown) {
      // TODO: we currently (falsely) assume that the only error caught is because the coupon is not valid, but there
      //  could be a network failure as well (JWPCheckoutService)
      throw new FormValidationError({ couponCode: [i18next.t('account:checkout.coupon_not_valid')] });
    }

    if (response.errors.length > 0) {
      // clear the order when the order doesn't exist on the server
      if (response.errors[0].includes(`Order with ${order.id} not found`)) {
        useCheckoutStore.getState().setOrder(null);
      }

      // TODO: this handles the `Coupon ${couponCode} not found` message (CleengCheckoutService)
      if (response.errors[0].includes(`not found`)) {
        throw new FormValidationError({ couponCode: [i18next.t('account:checkout.coupon_not_valid')] });
      }

      throw new FormValidationError({ form: response.errors });
    }

    if (response.responseData.order) {
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

  //
  paymentWithoutDetails = async (): Promise<Payment> => {
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');

    const response = await this.checkoutService.paymentWithoutDetails({ orderId: order.id });

    if (response.errors.length > 0) throw new Error(response.errors[0]);
    if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

    return response.responseData;
  };

  directPostCardPayment = async ({ cardPaymentPayload, referrer, returnUrl }: { cardPaymentPayload: CardPaymentData; referrer: string; returnUrl: string }) => {
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

    if (response.errors.length > 0) {
      throw new Error(response.errors[0]);
    }

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

    if (response.errors.length > 0) {
      throw new Error(response.errors[0]);
    }

    return response.responseData;
  };

  paypalPayment = async ({
    successUrl,
    waitingUrl,
    cancelUrl,
    errorUrl,
    couponCode = '',
  }: {
    successUrl: string;
    waitingUrl: string;
    cancelUrl: string;
    errorUrl: string;
    couponCode: string;
  }): Promise<{ redirectUrl: string }> => {
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

    return {
      redirectUrl: response.responseData.redirectUrl,
    };
  };

  getSubscriptionSwitches = async (): Promise<string[] | null> => {
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();

    assertModuleMethod(this.checkoutService.getSubscriptionSwitches, 'getSubscriptionSwitches is not available in checkout service');
    assertModuleMethod(this.checkoutService.getOffer, 'getOffer is not available in checkout service');

    const { subscription } = useAccountStore.getState();

    if (!subscription) return null;

    const response = await this.checkoutService.getSubscriptionSwitches({
      customerId: customerId,
      offerId: subscription.offerId,
    });

    if (!response.responseData.available.length) return null;

    return response.responseData.available.map(({ toOfferId }) => toOfferId);
  };

  switchSubscription = async () => {
    const selectedOffer = useCheckoutStore.getState().selectedOffer;
    const subscription = useAccountStore.getState().subscription;
    const { getAccountInfo } = useAccountStore.getState();
    const { customerId } = getAccountInfo();

    if (!selectedOffer || !subscription) throw new Error('No offer selected');

    assertModuleMethod(this.checkoutService.switchSubscription, 'switchSubscription is not available in checkout service');

    const switchDirection: 'upgrade' | 'downgrade' = determineSwitchDirection(subscription);

    const switchSubscriptionPayload = {
      toOfferId: selectedOffer.offerId,
      customerId: customerId,
      offerId: subscription.offerId,
      switchDirection: switchDirection,
    };

    await this.checkoutService.switchSubscription(switchSubscriptionPayload);
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
