import { useMutation } from 'react-query';
import type { Customer } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';

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
