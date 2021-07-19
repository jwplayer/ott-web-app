type ChildrenParams = {
  account: Account;
  update: () => void;
};

type Props = {
  children: (data: ChildrenParams) => JSX.Element;
};

const Account = ({ children }: Props): JSX.Element => {
  const account: Account = {};
  const update = (values: Account) => console.info('update', values);

  return children({ account, update } as ChildrenParams);
};

export default Account;
