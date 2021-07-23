import { useMutation, useQuery } from 'react-query';
import type { PaymentDetail, Subscription, Transaction, UpdateSubscriptionPayload } from 'types/subscription';

import { getPaymentDetails, getSubscriptions, getTransactions, updateSubscriptions } from '../../services/subscription.service';
import { AccountStore } from '../../stores/AccountStore';
import { ConfigStore } from '../../stores/ConfigStore';

type ChildrenParams = {
  subscriptions: Subscription[];
  paymentDetails: PaymentDetail[];
  transactions: Transaction[];
  isLoading: boolean;
  onUpdateSubscriptionSubmit: (subscriptions: Subscription) => void;
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
  const customerId = customer?.id || '';

  const getSubscriptionsQuery = useQuery(['subscriptions', customerId], () => getSubscriptions({ customerId }, sandbox, jwt));
  const { data: subscriptions, isLoading: isSubscriptionsLoading } = getSubscriptionsQuery;

  const subscriptionMutation = useMutation((values: UpdateSubscriptionPayload) => updateSubscriptions(values, sandbox, jwt));
  const { mutate: mutateSubscriptions, isLoading: isSubscriptionMutationLoading } = subscriptionMutation;

  const getPaymentDetailsQuery = useQuery(['paymentDetails', customerId], () => getPaymentDetails({ customerId }, sandbox, jwt));
  const { data: paymentDetails, isLoading: isPaymentDetailsLoading } = getPaymentDetailsQuery;

  const getTransactionsQuery = useQuery(['transactions', customerId], () => getTransactions({ customerId }, sandbox, jwt));
  const { data: transactions, isLoading: isTransactionsLoading } = getTransactionsQuery;

  const onUpdateSubscriptionSubmit = ({ offerId, status }: Subscription, cancellationReason?: string) => {
    mutateSubscriptions({ customerId, offerId, status, cancellationReason });
  };

  return children({
    subscriptions: subscriptions?.responseData,
    paymentDetails: paymentDetails?.responseData.paymentDetails,
    transactions: transactions?.responseData,
    isLoading: isSubscriptionsLoading || isPaymentDetailsLoading || isTransactionsLoading || isSubscriptionMutationLoading,
    onUpdateSubscriptionSubmit,
  } as ChildrenParams);
};

export default SubscriptionContainer;
