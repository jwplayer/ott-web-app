import { useMutation } from 'react-query';
import { useEffect } from 'react';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { isSVODOffer } from '@jwp/ott-common/src/utils/offers';
import type { OfferType } from '@jwp/ott-common/types/checkout';

const useOffers = () => {
  const checkoutController = getModule(CheckoutController);
  const accountController = getModule(AccountController);

  const { availableOffers, requestedMediaOffers } = useCheckoutStore(
    ({ availableOffers, requestedMediaOffers }) => ({ availableOffers, requestedMediaOffers }),
    shallow,
  );

  const initialiseOffers = useMutation<void>({
    mutationKey: ['initialiseOffers'],
    mutationFn: checkoutController.initialiseOffers,
  });

  const chooseOffer = useMutation({
    mutationKey: ['chooseOffer'],
    mutationFn: checkoutController.chooseOffer,
  });

  const switchSubscription = useMutation({
    mutationKey: ['switchSubscription'],
    mutationFn: checkoutController.switchSubscription,
    onSuccess: () => accountController.reloadSubscriptions({ delay: 7500 }), // @todo: Is there a better way to wait?
  });

  useEffect(() => {
    if (!availableOffers.length && !initialiseOffers.isLoading) {
      initialiseOffers.mutate();
    }
  }, [availableOffers, initialiseOffers]);

  useEffect(() => {
    return () => checkoutController.resetOffers();
  }, [checkoutController]);

  const hasSvodOffers = availableOffers.some(isSVODOffer);
  const hasMediaOffers = availableOffers.some((offer) => !isSVODOffer(offer));
  const hasPremierOffers = requestedMediaOffers.some((mediaOffer) => mediaOffer.premier);
  const hasMultipleOfferTypes = hasSvodOffers && hasMediaOffers && !hasPremierOffers;

  const defaultOfferType: OfferType = hasPremierOffers || !hasSvodOffers ? 'tvod' : 'svod';

  return {
    isLoading: initialiseOffers.isLoading || chooseOffer.isLoading,
    availableOffers,
    chooseOffer,
    switchSubscription,
    hasMultipleOfferTypes,
    defaultOfferType,
  };
};

export default useOffers;
