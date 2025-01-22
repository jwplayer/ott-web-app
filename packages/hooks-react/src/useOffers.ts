import { useMutation, useQuery } from 'react-query';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import type { OfferType } from '@jwp/ott-common/types/checkout';

const useOffers = () => {
  const checkoutController = getModule(CheckoutController);
  const accountController = getModule(AccountController);

  const { mediaOffers, subscriptionOffers, switchSubscriptionOffers, requestedMediaOffers } = useCheckoutStore(
    ({ mediaOffers, subscriptionOffers, switchSubscriptionOffers, requestedMediaOffers }) => ({
      mediaOffers,
      subscriptionOffers,
      switchSubscriptionOffers,
      requestedMediaOffers,
    }),
    shallow,
  );

  const { isLoading: isInitialisationLoading } = useQuery<void>({
    queryKey: ['initialiseOffers', requestedMediaOffers],
    queryFn: checkoutController.initialiseOffers,
  });

  const chooseOffer = useMutation({
    mutationKey: ['chooseOffer'],
    mutationFn: checkoutController.chooseOffer,
  });

  const switchSubscription = useMutation({
    mutationKey: ['switchSubscription'],
    mutationFn: checkoutController.switchSubscription,
    onSuccess: () => accountController.reloadSubscriptions({ delay: 3000, retry: 10 }), // A subscription switch usually takes at least 3 secs
  });

  const hasMediaOffers = mediaOffers.length > 0;
  const hasSubscriptionOffers = subscriptionOffers.length > 0;
  const hasPremierOffers = requestedMediaOffers.some((mediaOffer) => mediaOffer.premier);
  const hasMultipleOfferTypes = (subscriptionOffers.length > 0 || switchSubscriptionOffers.length > 0) && hasMediaOffers && !hasPremierOffers;
  const defaultOfferType: OfferType = hasPremierOffers || !hasSubscriptionOffers ? 'tvod' : 'svod';

  return {
    isLoading: isInitialisationLoading || chooseOffer.isLoading,
    mediaOffers,
    subscriptionOffers,
    switchSubscriptionOffers,
    chooseOffer,
    switchSubscription,
    hasMultipleOfferTypes,
    defaultOfferType,
  };
};

export default useOffers;
