import type { CleengCustomer } from '../types/models';
import type { Customer } from '../../../../../types/account';

export const formatCustomer = (customer: CleengCustomer): Customer => {
  return {
    id: customer.id,
    email: customer.email,
    country: customer.country,
    firstName: customer.firstName,
    lastName: customer.lastName,
    fullName: `${customer.firstName} ${customer.lastName}`,
    // map `externalData` to `metadata` (NOTE; The Cleeng API returns parsed values)
    metadata: customer.externalData || {},
  };
};
