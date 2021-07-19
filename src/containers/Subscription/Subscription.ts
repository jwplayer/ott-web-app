import type { Subscription } from 'types/subscription';

type ChildrenParams = {
  subscription: Subscription;
  update: () => void;
};

type Props = {
  children: (data: ChildrenParams) => JSX.Element;
};

const SubscriptionContainer = ({ children }: Props): JSX.Element => {
  const subscription: Subscription = {
    subscriptionId: 1,
    offerId: '2',
    status: 'active',
    expiresAt: 2000,
    nextPaymentPrice: 20,
    nextPaymentCurrency: 'euro',
    paymentGateway: 'todo',
    paymentMethod: 'todo',
    offerTitle: 'Temporary offer',
    period: 'month',
    totalPrice: 300,
  };
  const update = (values: Subscription) => console.info('update', values);

  return children({ subscription, update } as ChildrenParams);
};

export default SubscriptionContainer;
