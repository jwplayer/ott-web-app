import { useMutation } from 'react-query';

import { useAccountStore } from '#src/stores/AccountStore';
import type { Customer, EmailConfirmPasswordInput, FirstLastNameInput } from '#types/account';
import AccountController from '#src/controllers/AccountController';
import CheckoutController from '#src/controllers/CheckoutController';
import { getModule } from '#src/modules/container';

export const useSubscriptionChange = (
  isUpgradeOffer: boolean,
  selectedOfferId: string | null,
  customer: Customer | null,
  activeSubscriptionId: string | number | undefined,
) => {
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);

  const updateSubscriptionMetadata = useMutation((args: FirstLastNameInput | EmailConfirmPasswordInput) => accountController.updateUser(args), {
    onSuccess: () => {
      useAccountStore.setState({
        loading: false,
      });
    },
  });

  return useMutation((args: { accessFeeId: string; subscriptionId: string }) => checkoutController.changeSubscription(args), {
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
