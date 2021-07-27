import type { Consent, Customer, CustomerConsent, UpdateCustomerConsentsPayload, UpdateCustomerPayload } from 'types/account';
import { useMutation, useQuery } from 'react-query';
import type { CustomerFormErrors, CustomerFormValues, FormErrors } from 'types/form';

import { ConfigStore } from '../../stores/ConfigStore';
import { AccountStore } from '../../stores/AccountStore';
import { getCustomerConsents, getPublisherConsents, updateCustomer, updateCustomerConsents } from '../../services/account.service';

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

const AccountContainer = ({ children, fetchConsents = true }: Props): JSX.Element => {
  const customer = AccountStore.useState((state) => state.user);
  const auth = AccountStore.useState((state) => state.auth);
  const { cleengId, cleengSandbox } = ConfigStore.useState((s) => s.config);
  const jwt = auth?.jwt || '';
  const publisherId = cleengId || '';
  const customerId = customer?.id || 0;

  const customerMutation = useMutation((values: CustomerFormValues) => updateCustomer(values, cleengSandbox, jwt));
  const { mutate: mutateCustomer, isLoading: isMutateCustomerLoading, data: mutateCustomerData, reset } = customerMutation;

  const mutation = useMutation((values: UpdateCustomerConsentsPayload) => updateCustomerConsents(values, cleengSandbox, jwt));
  const { mutate: mutateConsents, isLoading: isMutateConsentsLoading, data: mutateConsentsData } = mutation;

  const enabled = fetchConsents && !!publisherId && !!customer?.id;
  const fetchPublicherConsents = useQuery(['publisherConsents'], () => getPublisherConsents({ publisherId }, cleengSandbox), { enabled });
  const { data: publisherConsents, isLoading: publisherConsentsLoading } = fetchPublicherConsents;

  const fetchCustomerConsents = useQuery(['customerConsents'], () => getCustomerConsents({ customerId: customerId.toString() }, cleengSandbox, jwt), {
    enabled,
  });
  const { data: customerConsents, isLoading: customerConsentsLoading } = fetchCustomerConsents;

  const onUpdateEmailSubmit = ({ id, email, confirmationPassword }: CustomerFormValues) => mutateCustomer({ id, email, confirmationPassword });
  const onUpdateInfoSubmit = ({ id, firstName, lastName }: CustomerFormValues) => mutateCustomer({ id, firstName, lastName });
  const onUpdateConsentsSubmit = (consents: CustomerConsent[]) => mutateConsents({ id: customerId.toString(), consents });

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
    isLoading: isMutateCustomerLoading || isMutateConsentsLoading,
    errors: translateErrors(mutateCustomerData?.errors || mutateConsentsData?.errors),
    publisherConsents: publisherConsents?.responseData?.consents,
    customerConsents: customerConsents?.responseData?.consents,
    consentsLoading: publisherConsentsLoading || customerConsentsLoading,
    onUpdateEmailSubmit,
    onUpdateInfoSubmit,
    onUpdateConsentsSubmit,
    onReset: reset,
  } as ChildrenParams);
};

export default AccountContainer;
