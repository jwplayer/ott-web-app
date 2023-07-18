import { useMutation } from 'react-query';

import { updateUser } from '#src/stores/AccountController';
import { useAccountStore } from '#src/stores/AccountStore';
import { changeSubscription } from '#src/stores/CheckoutController';
import type { Customer } from '#types/account';

export const useSubscriptionChange = (
  isUpgradeOffer: boolean,
  selectedOfferId: string | null,
  customer: Customer | null,
  activeSubscriptionId: string | number | undefined,
) => {
  const updateSubscriptionMetadata = useMutation(updateUser, {
    onSuccess: () => {
      useAccountStore.setState({
        loading: false,
      });
    },
  });

  return useMutation(changeSubscription, {
    onSuccess: () => {
      if (!isUpgradeOffer && selectedOfferId) {
        updateSubscriptionMetadata.mutate({
          firstName: customer?.firstName || '',
          lastName: customer?.lastName || '',
          metadata: {
            [`${activeSubscriptionId}_pending_downgrade`]: selectedOfferId,
          },
        });
      }
    },
  });
};
