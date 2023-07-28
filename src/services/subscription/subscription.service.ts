import type {
  ChangeSubscription,
  FetchReceipt,
  GetPaymentDetails,
  GetActivePayment,
  GetSubscriptions,
  GetTransactions,
  UpdateCardDetails,
  UpdateSubscription,
  GetAllTransactions,
  GetActiveSubscription,
} from '#types/subscription';

export default interface SubscriptionService {
  getActiveSubscription: GetActiveSubscription;

  getAllTransactions: GetAllTransactions;

  getActivePayment: GetActivePayment;

  getSubscriptions: GetSubscriptions;

  updateSubscription: UpdateSubscription;

  changeSubscription: ChangeSubscription;

  updateCardDetails: UpdateCardDetails;

  getPaymentDetails: GetPaymentDetails;

  getTransactions: GetTransactions;

  fetchReceipt: FetchReceipt;
}
