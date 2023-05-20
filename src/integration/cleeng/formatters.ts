import type { Customer } from '#types/cleeng';
import type { AccountDetails } from '#types/app';
import { isString } from '#src/utils/common';

export const formatAccountDetails = (customer: Customer): AccountDetails => {
  return {
    id: customer.id,
    email: customer.email,
    profile: {
      firstName: isString(customer.metadata?.first_name) ? customer.metadata?.first_name : '',
      lastName: isString(customer.metadata?.surname) ? customer.metadata?.surname : '',
    },
  };
};
