import { useMutation } from 'react-query';

import { useAccountStore } from '#src/stores/AccountStore';
import type { Customer, EmailConfirmPasswordInput, FirstLastNameInput } from '#types/account';
import type AccountController from '#src/stores/AccountController';
import type CheckoutController from '#src/stores/CheckoutController';
import { useController } from '#src/ioc/container';
import { CONTROLLERS } from '#src/ioc/types';

export const useSubscriptionChange = (
  isUpgradeOffer: boolean,
  selectedOfferId: string | null,
  customer: Customer | null,
  activeSubscriptionId: string | number | undefined,
) => {
  const accountController = useController<AccountController>(CONTROLLERS.Account);
  const checkoutController = useController<CheckoutController>(CONTROLLERS.Checkout);

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
