import InPlayer, { AccessFee, MerchantPaymentMethod } from '@inplayer-org/inplayer.js';
import { injectable } from 'inversify';

import CheckoutService from './checkout.service';

import type {
  CardPaymentData,
  CreateOrder,
  CreateOrderArgs,
  GetEntitlements,
  GetEntitlementsResponse,
  GetOffers,
  GetPaymentMethods,
  Offer,
  Order,
  Payment,
  PaymentMethod,
  PaymentWithAdyen,
  PaymentWithoutDetails,
  PaymentWithPayPal,
  UpdateOrder,
} from '#types/checkout';
import { isSVODOffer } from '#src/utils/subscription';

@injectable()
export default class InplayerCheckoutService extends CheckoutService {
  private readonly cardPaymentProvider = 'stripe';

  private formatPaymentMethod = (method: MerchantPaymentMethod, cardPaymentProvider: string): PaymentMethod => {
    return {
      id: method.id,
      methodName: method.method_name.toLocaleLowerCase(),
      provider: cardPaymentProvider,
      logoUrl: '',
    } as PaymentMethod;
  };

  private formatEntitlements = (expiresAt: number = 0, accessGranted: boolean = false): ServiceResponse<GetEntitlementsResponse> => {
    return {
      errors: [],
      responseData: {
        accessGranted,
        expiresAt,
      },
    };
  };

  private formatOffer = (offer: AccessFee): Offer => {
    const ppvOffers = ['ppv', 'ppv_custom'];
    const offerId = ppvOffers.includes(offer.access_type.name) ? `C${offer.id}` : `S${offer.id}`;

    return {
      id: offer.id,
      offerId,
      offerCurrency: offer.currency,
      customerPriceInclTax: offer.amount,
      customerCurrency: offer.currency,
      offerTitle: offer.description,
      active: true,
      period: offer.access_type.period === 'month' && offer.access_type.quantity === 12 ? 'year' : offer.access_type.period,
      freePeriods: offer.trial_period ? 1 : 0,
      planSwitchEnabled: offer.item.plan_switch_enabled ?? false,
    } as Offer;
  };

  private formatOrder = (payload: CreateOrderArgs): Order => {
    return {
      id: payload.offer.id,
      customerId: payload.customerId,
      offerId: payload.offer.offerId,
      totalPrice: payload.offer.customerPriceInclTax,
      priceBreakdown: {
        offerPrice: payload.offer.customerPriceInclTax,
        discountAmount: payload.offer.customerPriceInclTax,
        discountedPrice: payload.offer.customerPriceInclTax,
        paymentMethodFee: 0,
        taxValue: 0,
      },
      taxRate: 0,
      currency: payload.offer.offerCurrency || 'EUR',
      requiredPaymentDetails: true,
    } as Order;
  };

  createOrder: CreateOrder = async (payload) => {
    return {
      errors: [],
      responseData: {
        message: '',
        order: this.formatOrder(payload),
        success: true,
      },
    };
  };

  getOffers: GetOffers = async (payload) => {
    const offers = await Promise.all(
      payload.offerIds.map(async (assetId) => {
        try {
          const { data } = await InPlayer.Asset.getAssetAccessFees(parseInt(`${assetId}`));

          return data?.map((offer) => this.formatOffer(offer));
        } catch {
          throw new Error('Failed to get offers');
        }
      }),
    );

    return offers.flat();
  };

  getPaymentMethods: GetPaymentMethods = async () => {
    try {
      const response = await InPlayer.Payment.getPaymentMethods();
      const paymentMethods: PaymentMethod[] = [];
      response.data.forEach((method: MerchantPaymentMethod) => {
        if (['card', 'paypal'].includes(method.method_name.toLowerCase())) {
          paymentMethods.push(this.formatPaymentMethod(method, this.cardPaymentProvider));
        }
      });
      return {
        errors: [],
        responseData: {
          message: '',
          paymentMethods,
          status: 1,
        },
      };
    } catch {
      throw new Error('Failed to get payment methods');
    }
  };

  paymentWithPayPal: PaymentWithPayPal = async (payload) => {
    try {
      const response = await InPlayer.Payment.getPayPalParams({
        origin: `${window.location.origin}?u=waiting-for-payment`,
        accessFeeId: payload.order.id,
        paymentMethod: 2,
        voucherCode: payload.couponCode,
      });

      if (response.data?.id) {
        return {
          errors: ['Already have an active access'],
          responseData: {
            redirectUrl: payload.errorUrl,
          },
        };
      }
      return {
        errors: [],
        responseData: {
          redirectUrl: response.data.endpoint,
        },
      };
    } catch {
      throw new Error('Failed to generate PayPal payment url');
    }
  };

  iFrameCardPayment: PaymentWithAdyen = async () => {
    return {
      errors: [],
      responseData: {} as Payment,
    };
  };

  paymentWithoutDetails: PaymentWithoutDetails = async () => {
    return {
      errors: [],
      responseData: {} as Payment,
    };
  };

  updateOrder: UpdateOrder = async ({ order, couponCode }) => {
    try {
      const response = await InPlayer.Voucher.getDiscount({
        voucherCode: `${couponCode}`,
        accessFeeId: order.id,
      });
      order.discount = {
        applied: true,
        type: 'coupon',
        periods: response.data.discount_duration,
      };

      const discountedAmount = order.totalPrice - response.data.amount;
      order.totalPrice = response.data.amount;
      order.priceBreakdown.discountAmount = discountedAmount;
      order.priceBreakdown.discountedPrice = discountedAmount;
      return {
        errors: [],
        responseData: {
          message: 'successfully updated',
          order: order,
          success: true,
        },
      };
    } catch {
      throw new Error('Invalid coupon code');
    }
  };

  getEntitlements: GetEntitlements = async ({ offerId }) => {
    try {
      const response = await InPlayer.Asset.checkAccessForAsset(parseInt(offerId));
      return this.formatEntitlements(response.data.expires_at, true);
    } catch {
      return this.formatEntitlements();
    }
  };

  directPostCardPayment = async (cardPaymentPayload: CardPaymentData, order: Order) => {
    const payload = {
      number: cardPaymentPayload.cardNumber.replace(/\s/g, ''),
      cardName: cardPaymentPayload.cardholderName,
      expMonth: cardPaymentPayload.cardExpMonth || '',
      expYear: cardPaymentPayload.cardExpYear || '',
      cvv: cardPaymentPayload.cardCVC,
      accessFee: order.id,
      paymentMethod: 1,
      voucherCode: cardPaymentPayload.couponCode,
      referrer: window.location.href,
      returnUrl: `${window.location.href}&u=waiting-for-payment`,
    };

    try {
      if (isSVODOffer(order)) {
        await InPlayer.Subscription.createSubscription(payload);
      } else {
        await InPlayer.Payment.createPayment(payload);
      }

      return true;
    } catch {
      throw new Error('Failed to make payment');
    }
  };

  getSubscriptionSwitches = undefined;

  getOrder = undefined;

  switchSubscription = undefined;

  getSubscriptionSwitch = undefined;

  createAdyenPaymentSession = undefined;

  initialAdyenPayment = undefined;

  finalizeAdyenPayment = undefined;

  updatePaymentMethodWithPayPal = undefined;

  deletePaymentMethod = undefined;

  addAdyenPaymentDetails = undefined;

  finalizeAdyenPaymentDetails = undefined;

  getOffer = undefined;
}
