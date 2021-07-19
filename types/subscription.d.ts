export type Subscription = {
  subscriptionId: number,
  offerId: string,
  status: 'active' | 'cancelled' | 'expired' | 'terminated',
  expiresAt: number,
  nextPaymentPrice: number,
  nextPaymentCurrency: string,
  paymentGateway: string,
  paymentMethod: string,
  offerTitle: string,
  period: string,
  totalPrice: number,
}
