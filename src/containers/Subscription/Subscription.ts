type ChildrenParams = {
  subscription: Account;
  update: () => void;
};

type Props = {
  children: (data: ChildrenParams) => JSX.Element;
};

const Subscription = ({ children }: Props): JSX.Element => {
  const subscription: Subscription = {};
  const update = (values: Subscription) => console.info('update', values);

  return children({ subscription, update } as ChildrenParams);
};

export default Subscription;
