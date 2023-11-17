import { useMutation } from 'react-query';
import type { Customer } from '@jwplayer/ott-common/types/account';
import { getModule } from '@jwplayer/ott-common/src/modules/container';
import { useAccountStore } from '@jwplayer/ott-common/src/stores/AccountStore';
import AccountController from '@jwplayer/ott-common/src/stores/AccountController';
import CheckoutController from '@jwplayer/ott-common/src/stores/CheckoutController';

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
