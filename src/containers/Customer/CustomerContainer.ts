import type { Customer, UpdateCustomerPayload } from 'types/account';
import { useMutation } from 'react-query';

import { ConfigStore } from '../../stores/ConfigStore';
import { AccountStore } from '../../stores/AccountStore';
import { updateCustomer } from '../../services/account.service';
import type { FormErrors, FormValues } from '../../hooks/useForm';

type ChildrenParams = {
  customer: Customer;
  errors: FormErrors<UpdateCustomerPayload>;
  isLoading: boolean;
  onUpdateEmailSubmit: (values: CustomerFormValues) => void;
  onUpdateInfoSubmit: (values: CustomerFormValues) => void;
  onReset: () => void;
};

type CustomerFormValues = FormValues<UpdateCustomerPayload>;
type CustomerFormErrors = FormErrors<UpdateCustomerPayload>;

type Props = {
  children: (data: ChildrenParams) => JSX.Element;
};

const CustomerContainer = ({ children }: Props): JSX.Element => {
  const customer = AccountStore.useState((state) => state.user);
  const auth = AccountStore.useState((state) => state.auth);
  const {
    config: { cleengSandbox },
  } = ConfigStore.getRawState();

  const { mutate, isLoading, data, reset } = useMutation((values: CustomerFormValues) => updateCustomer(values, cleengSandbox, auth?.jwt || ''));

  const onUpdateEmailSubmit = ({ id, email, confirmationPassword }: CustomerFormValues) => mutate({ id, email, confirmationPassword });
  const onUpdateInfoSubmit = ({ id, firstName, lastName }: CustomerFormValues) => mutate({ id, firstName, lastName });

  const translateErrors = (errors?: string[]) => {
    const formErrors: CustomerFormErrors = {};

    errors?.map((error) => {
      switch (error) {
        case 'Invalid param email':
          formErrors.email = 'Invalid email address!';
          break;
        case 'Customer email already exists':
          formErrors.email = 'Email already exists!';
          break;
        case 'Please enter a valid e-mail address.':
          formErrors.email = 'Please enter a valid e-mail address.';
          break;
        case 'Invalid confirmationPassword': {
          formErrors.confirmationPassword = 'Password incorrect!';
          break;
        }
        default:
          console.info('Unknown error', error);
          return;
      }
    });
    return formErrors;
  };

  return children({
    customer,
    isLoading,
    errors: translateErrors(data?.errors),
    onUpdateEmailSubmit,
    onUpdateInfoSubmit,
    onReset: reset,
  } as ChildrenParams);
};

export default CustomerContainer;
