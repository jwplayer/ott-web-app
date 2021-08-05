import { useQuery } from 'react-query';
import type { PaymentDetail, Subscription, Transaction } from 'types/subscription';

import { getPaymentDetails, getSubscriptions, getTransactions } from '../../services/subscription.service';
import { AccountStore } from '../../stores/AccountStore';
import { ConfigStore } from '../../stores/ConfigStore';

type ChildrenParams = {
  activeSubscription?: Subscription;
  subscriptions: Subscription[];
  paymentDetails: PaymentDetail[];
  activePaymentDetail?: PaymentDetail;
  transactions: Transaction[];
  isLoading: boolean;
  onUpdateSubscriptionSubmit: () => void;
};

type Props = {
  children: (data: ChildrenParams) => JSX.Element;
};

const SubscriptionContainer = ({ children }: Props): JSX.Element => {
  const customer = AccountStore.useState((state) => state.user);
  const auth = AccountStore.useState((state) => state.auth);
  const { config } = ConfigStore.getRawState();
  const { cleengSandbox: sandbox } = config;
  const jwt = auth?.jwt || '';
  const customerId = customer?.id || -1; // id must be number

  const getSubscriptionsQuery = useQuery(['subscriptions', customerId], () => getSubscriptions({ customerId }, sandbox, jwt));
  const { data: subscriptions, isLoading: isSubscriptionsLoading } = getSubscriptionsQuery;

  const getPaymentDetailsQuery = useQuery(['paymentDetails', customerId], () => getPaymentDetails({ customerId }, sandbox, jwt));
  const { data: paymentDetails, isLoading: isPaymentDetailsLoading } = getPaymentDetailsQuery;

  const getTransactionsQuery = useQuery(['transactions', customerId], () => getTransactions({ customerId }, sandbox, jwt));
  const { data: transactions, isLoading: isTransactionsLoading } = getTransactionsQuery;

  return children({
    activeSubscription: subscriptions?.responseData?.items.find(
      (subscription) => subscription.status !== 'expired' && subscription.status !== 'terminated',
    ),
    activePaymentDetail: paymentDetails?.responseData?.paymentDetails.find((paymentDetails) => paymentDetails.active),
    subscriptions: subscriptions?.responseData?.items,
    paymentDetails: paymentDetails?.responseData?.paymentDetails,
    transactions: transactions?.responseData?.items,
    isLoading: isSubscriptionsLoading || isPaymentDetailsLoading || isTransactionsLoading,
  } as ChildrenParams);
};

export default SubscriptionContainer;
