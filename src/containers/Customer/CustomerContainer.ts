import type { Customer } from 'types/account';

import { ConfigStore } from '../../stores/ConfigStore';
import { AccountStore } from '../../stores/AccountStore';
import { updateCustomer } from '../../services/account.service';

type ChildrenParams = {
  customer: Customer;
  onUpdateEmailSubmit: (values: FormValues) => void;
  onUpdateInfoSubmit: (values: FormValues) => void;
};

type Props = {
  children: (data: ChildrenParams) => JSX.Element;
};

const CustomerContainer = ({ children }: Props): JSX.Element => {
  const customer = AccountStore.useState((state) => state.user);
  const auth = AccountStore.useState((state) => state.auth);
  const {
    config: { cleengSandbox },
  } = ConfigStore.getRawState();

  const onUpdateEmailSubmit = (values: FormValues) => {
    if (auth?.jwt) {
      updateCustomer({ id: values.id, email: values.email, confirmationPassword: values.confirmationPassword }, cleengSandbox, auth.jwt);
    }
  };
  const onUpdateInfoSubmit = (values: FormValues) => {
    if (auth?.jwt) {
      updateCustomer({ id: values.id, firstName: values.firstName, lastName: values.lastName }, cleengSandbox, auth.jwt);
    }
  };

  return children({ customer, onUpdateEmailSubmit, onUpdateInfoSubmit } as ChildrenParams);
};

export default CustomerContainer;
