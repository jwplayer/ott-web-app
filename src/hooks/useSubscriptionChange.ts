import { useMutation } from 'react-query';

import { useAccountStore } from '#src/stores/AccountStore';
import type { Customer } from '#types/account';
import AccountController from '#src/stores/AccountController';
import CheckoutController from '#src/stores/CheckoutController';
import { getModule } from '#src/modules/container';

export const useSubscriptionChange = (
  isUpgradeOffer: boolean,
  selectedOfferId: string | null,
  customer: Customer | null,
  activeSubscriptionId: string | number | undefined,
) => {
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);

  const updateSubscriptionMetadata = useMutation(accountController.updateUser, {
    onSuccess: () => {
      useAccountStore.setState({
        loading: false,
      });
    },
  });

  return useMutation(checkoutController.changeSubscription, {
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
