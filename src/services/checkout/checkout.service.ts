import type {
  AddAdyenPaymentDetails,
  CreateOrder,
  DeletePaymentMethod,
  FinalizeAdyenPaymentDetails,
  GetAdyenPaymentSession,
  GetEntitlements,
  GetFinalizeAdyenPayment,
  GetInitialAdyenPayment,
  GetOffers,
  GetOrder,
  GetPaymentMethods,
  GetSubscriptionSwitch,
  GetCardPaymentProvider,
  GetSubscriptionSwitches,
  PaymentWithoutDetails,
  PaymentWithPayPal,
  SwitchSubscription,
  GetDirectPostCardPayment,
  UpdateOrder,
  UpdatePaymentWithPayPal,
  GetOffer,
} from '#types/checkout';

export default interface CheckoutService {
  cardPaymentProvider?: string;

  getCardPaymentProvider: GetCardPaymentProvider;

  getOffer: GetOffer;

  getOffers: GetOffers;

  createOrder: CreateOrder;

  updateOrder: UpdateOrder;

  getPaymentMethods: GetPaymentMethods;

  paymentWithoutDetails: PaymentWithoutDetails;

  paymentWithPayPal: PaymentWithPayPal;

  getEntitlements: GetEntitlements;

  directPostCardPayment: GetDirectPostCardPayment;

  getOrder: GetOrder;

  switchSubscription: SwitchSubscription;

  getSubscriptionSwitches: GetSubscriptionSwitches;

  getSubscriptionSwitch: GetSubscriptionSwitch;

  createAdyenPaymentSession: GetAdyenPaymentSession;

  initialAdyenPayment: GetInitialAdyenPayment;

  finalizeAdyenPayment: GetFinalizeAdyenPayment;

  updatePaymentMethodWithPayPal: UpdatePaymentWithPayPal;

  deletePaymentMethod: DeletePaymentMethod;

  addAdyenPaymentDetails: AddAdyenPaymentDetails;

  finalizeAdyenPaymentDetails: FinalizeAdyenPaymentDetails;
}
