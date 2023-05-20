import type { AccountData } from '@inplayer-org/inplayer.js';

import type { AccountDetails } from '#types/app';
import { isString } from '#src/utils/common';

export const formatAccountDetails = (account: AccountData): AccountDetails => {
  return {
    id: String(account.id),
    email: account.email,
    profile: {
      firstName: isString(account.metadata.first_name) ? account.metadata.first_name : '',
      lastName: isString(account.metadata.surname) ? account.metadata.surname : '',
    },
  };
};
