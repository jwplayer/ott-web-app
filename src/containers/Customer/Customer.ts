import type { Customer } from 'types/account';

type ChildrenParams = {
  customer: Customer;
  update: () => void;
};

type Props = {
  children: (data: ChildrenParams) => JSX.Element;
};

const Account = ({ children }: Props): JSX.Element => {
  const customer: Customer = {
    id: '1',
    email: 'todo@test.nl',
    locale: 'en_en',
    country: 'England',
    currency: 'Euro',
    lastUserIp: 'temp',
    firstName: 'Henk',
    lastName: 'Peterson',
  };
  const update = (customer: Customer) => console.info('update', customer);

  return children({ customer, update } as ChildrenParams);
};

export default Account;
