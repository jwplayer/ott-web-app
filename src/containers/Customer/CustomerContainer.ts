import type { Consent, Customer, CustomerConsent, UpdateCustomerPayload } from 'types/account';
import { useMutation, useQuery } from 'react-query';
import type { CustomerFormErrors, CustomerFormValues, FormErrors } from 'types/form';

import { ConfigStore } from '../../stores/ConfigStore';
import { AccountStore } from '../../stores/AccountStore';
import { getCustomerConsents, getPublisherConsents, updateCustomer } from '../../services/account.service';

type ChildrenParams = {
  customer: Customer;
  errors: FormErrors<UpdateCustomerPayload>;
  isLoading: boolean;
  consentsLoading: boolean;
  publisherConsents?: Consent[];
  customerConsents?: CustomerConsent[];
  onUpdateEmailSubmit: (values: CustomerFormValues) => void;
  onUpdateInfoSubmit: (values: CustomerFormValues) => void;
  onUpdateConsentsSubmit: (consents: CustomerConsent[]) => void;
  onReset: () => void;
};

type Props = {
  children: (data: ChildrenParams) => JSX.Element;
  fetchConsents?: boolean;
};

const CustomerContainer = ({ children, fetchConsents = true }: Props): JSX.Element => {
  const customer = AccountStore.useState((state) => state.user);
  const auth = AccountStore.useState((state) => state.auth);
  const { config } = ConfigStore.getRawState();
  const { cleengId, cleengSandbox } = config;
  const jwt = auth?.jwt || '';
  const publisherId = cleengId || '';
  const customerId = customer?.id || '';

  const { mutate, isLoading, data, reset } = useMutation((values: CustomerFormValues) => updateCustomer(values, cleengSandbox, jwt));

  const { data: publisherConsents, isLoading: publisherConsentsLoading } = useQuery(
    ['publisherConsents'],
    () => getPublisherConsents({ publisherId }, cleengSandbox),
    {
      enabled: fetchConsents && !!publisherId,
    },
  );
  const { data: customerConsents, isLoading: customerConsentsLoading } = useQuery(
    ['customerConsents'],
    () => getCustomerConsents({ customerId }, cleengSandbox, jwt),
    {
      enabled: fetchConsents && !!customer?.id,
    },
  );

  const onUpdateEmailSubmit = ({ id, email, confirmationPassword }: CustomerFormValues) => mutate({ id, email, confirmationPassword });
  const onUpdateInfoSubmit = ({ id, firstName, lastName }: CustomerFormValues) => mutate({ id, firstName, lastName });

  const onUpdateConsentsSubmit = (consents: CustomerConsent[]) => mutate({ id: customerId, consents });

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
    isLoading: isLoading,
    errors: translateErrors(data?.errors),
    publisherConsents: publisherConsents?.responseData?.consents,
    customerConsents: customerConsents?.responseData?.consents,
    consentsLoading: publisherConsentsLoading || customerConsentsLoading,
    onUpdateEmailSubmit,
    onUpdateInfoSubmit,
    onUpdateConsentsSubmit,
    onReset: reset,
  } as ChildrenParams);
};

export default CustomerContainer;
