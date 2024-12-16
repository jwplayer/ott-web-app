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
import { findDefaultCardMethodId } from '../utils/payments';

@injectable()
export default class CheckoutController {
  private readonly accountService?: AccountService;
  private readonly checkoutService?: CheckoutService;
  private readonly subscriptionService?: SubscriptionService;
  private readonly getCustomerIP: GetCustomerIP;

  constructor(@inject(INTEGRATION_TYPE) integrationType: IntegrationType, @inject(GET_CUSTOMER_IP) getCustomerIP: GetCustomerIP) {
    this.getCustomerIP = getCustomerIP;
    this.accountService = getNamedModule(AccountService, integrationType, false);
    this.checkoutService = getNamedModule(CheckoutService, integrationType, false);
    this.subscriptionService = getNamedModule(SubscriptionService, integrationType, false);
  }

  initialiseOffers = async () => {
    assertModuleMethod(this.accountService?.svodOfferIds, 'AccountService#svodOfferIds not defined');

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

  getSubscriptionOfferIds = () => this.accountService?.svodOfferIds || [];

  chooseOffer = async (selectedOffer: Offer) => {
    useCheckoutStore.setState({ selectedOffer });
  };

  initialiseOrder = async (offer: Offer): Promise<void> => {
    assertModuleMethod(this.checkoutService?.createOrder, 'CheckoutService#createOrder not defined');

    const { getAccountInfo } = useAccountStore.getState();
    const { customer } = getAccountInfo();

    const paymentMethods = await this.getPaymentMethods();
    const paymentMethodId = parseInt(findDefaultCardMethodId(paymentMethods));

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
    assertModuleMethod(this.checkoutService?.updateOrder, 'CheckoutService#updateOrder is not available');

    try {
      const response = await this.checkoutService.updateOrder({ order, paymentMethodId, couponCode });

      if (response.responseData.order) {
        useCheckoutStore.getState().setOrder(response.responseData?.order);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          useCheckoutStore.getState().setOrder(null);
        } else if (error.message === 'Invalid coupon code') {
          throw new FormValidationError({ couponCode: [i18next.t('account:checkout.coupon_not_valid')] });
        } else if (error.message === 'Invalid coupon code for this offer') {
          throw new FormValidationError({ couponCode: [i18next.t('account:checkout.coupon_not_valid_for_offer')] });
        }
      }

      throw new FormValidationError({ form: [i18next.t('error:unknown_error')] });
    }
  };

  getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    assertModuleMethod(this.checkoutService?.getPaymentMethods, 'CheckoutService#getPaymentMethods is not available');

    const { paymentMethods } = useCheckoutStore.getState();

    if (paymentMethods) return paymentMethods; // already fetched payment methods

    const response = await this.checkoutService.getPaymentMethods();

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    useCheckoutStore.getState().setPaymentMethods(response.responseData?.paymentMethods);

    return response.responseData?.paymentMethods;
  };

  //
  paymentWithoutDetails = async ({ captchaValue }: { captchaValue?: string } = {}): Promise<Payment> => {
    assertModuleMethod(this.checkoutService?.paymentWithoutDetails, 'CheckoutService#paymentWithoutDetails is not available');

    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');

    const response = await this.checkoutService.paymentWithoutDetails({ orderId: order.id, captchaValue });

    if (response.errors.length > 0) throw new Error(response.errors[0]);
    if (response.responseData.rejectedReason) throw new Error(response.responseData.rejectedReason);

    return response.responseData;
  };

  directPostCardPayment = async ({ cardPaymentPayload, referrer, returnUrl }: { cardPaymentPayload: CardPaymentData; referrer: string; returnUrl: string }) => {
    assertModuleMethod(this.checkoutService?.directPostCardPayment, 'CheckoutService#directPostCardPayment is not available');

    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');

    return await this.checkoutService.directPostCardPayment(cardPaymentPayload, order, referrer, returnUrl);
  };

  createAdyenPaymentSession = async (returnUrl: string, isInitialPayment: boolean = true): Promise<AdyenPaymentSession> => {
    const { order } = useCheckoutStore.getState();
    const orderId = order?.id;

    if (isInitialPayment && !orderId) throw new Error('There is no order to pay for');

    assertModuleMethod(this.checkoutService?.createAdyenPaymentSession, 'createAdyenPaymentSession is not available in checkout service');

    const response = await this.checkoutService.createAdyenPaymentSession({
      orderId: orderId,
      returnUrl: returnUrl,
    });

    if (response.errors.length > 0) {
      throw new Error(response.errors[0]);
    }

    return response.responseData;
  };

  initialAdyenPayment = async (paymentMethod: AdyenPaymentMethod, returnUrl: string, captchaValue?: string): Promise<InitialAdyenPayment> => {
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');

    assertModuleMethod(this.checkoutService?.initialAdyenPayment, 'initialAdyenPayment is not available in checkout service');

    const response = await this.checkoutService.initialAdyenPayment({
      orderId: order.id,
      returnUrl: returnUrl,
      paymentMethod,
      customerIP: await this.getCustomerIP(),
      captchaValue,
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  finalizeAdyenPayment = async (details: unknown, orderId?: number, paymentData?: string): Promise<FinalizeAdyenPayment> => {
    if (!orderId) throw new Error('No order created');

    assertModuleMethod(this.checkoutService?.finalizeAdyenPayment, 'finalizeAdyenPayment is not available in checkout service');

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
    captchaValue,
  }: {
    successUrl: string;
    waitingUrl: string;
    cancelUrl: string;
    errorUrl: string;
    couponCode: string;
    captchaValue?: string;
  }): Promise<{ redirectUrl: string }> => {
    const { order } = useCheckoutStore.getState();

    if (!order) throw new Error('No order created');

    assertModuleMethod(this.checkoutService?.paymentWithPayPal, 'CheckoutService#paymentWithPayPal is not available');

    const response = await this.checkoutService.paymentWithPayPal({
      order: order,
      successUrl,
      waitingUrl,
      cancelUrl,
      errorUrl,
      couponCode,
      captchaValue,
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return {
      redirectUrl: response.responseData.redirectUrl,
    };
  };

  getSubscriptionSwitches = async (): Promise<string[] | null> => {
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();
    const { subscription } = useAccountStore.getState();

    if (!subscription || !this.checkoutService?.getSubscriptionSwitches) return null;

    assertModuleMethod(this.checkoutService.getOffer, 'getOffer is not available in checkout service');

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

    assertModuleMethod(this.checkoutService?.switchSubscription, 'switchSubscription is not available in checkout service');

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
    assertModuleMethod(this.subscriptionService?.changeSubscription, 'changeSubscription is not available in subscription service');

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
    assertModuleMethod(this.checkoutService?.updatePaymentMethodWithPayPal, 'updatePaymentMethodWithPayPal is not available in checkout service');
    assertModuleMethod(this.checkoutService?.deletePaymentMethod, 'deletePaymentMethod is not available in checkout service');

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
    assertModuleMethod(this.checkoutService?.addAdyenPaymentDetails, 'addAdyenPaymentDetails is not available in checkout service');

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
    assertModuleMethod(this.checkoutService?.finalizeAdyenPaymentDetails, 'finalizeAdyenPaymentDetails is not available in checkout service');

    const response = await this.checkoutService.finalizeAdyenPaymentDetails({
      paymentMethodId,
      details,
      paymentData,
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  getOffers: GetOffers = (payload) => {
    assertModuleMethod(this.checkoutService?.getOffers, 'CheckoutService#getOffers is not available');

    return this.checkoutService.getOffers(payload);
  };

  getEntitlements: GetEntitlements = (payload) => {
    assertModuleMethod(this.checkoutService?.getEntitlements, 'CheckoutService#getEntitlements is not available');

    return this.checkoutService.getEntitlements(payload);
  };
}
