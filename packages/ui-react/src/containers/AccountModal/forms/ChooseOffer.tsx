import React, { useCallback, useEffect } from 'react';
import { mixed, object } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { Subscription } from '@jwp/ott-common/types/subscription';
import type { ChooseOfferFormData } from '@jwp/ott-common/types/checkout';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import { logDev } from '@jwp/ott-common/src/utils/common';
import useOffers from '@jwp/ott-hooks-react/src/useOffers';
import useForm, { type UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';
import useQueryParam from '@jwp/ott-ui-react/src/hooks/useQueryParam';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';

import ChooseOfferForm from '../../../components/ChooseOfferForm/ChooseOfferForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import type { AccountModals } from '../AccountModal';

const determineSwitchDirection = (subscription: Subscription | null) => {
  const currentPeriod = subscription?.period;

  if (currentPeriod === 'month') {
    return 'upgrade';
  } else if (currentPeriod === 'year') {
    return 'downgrade';
  } else {
    return 'upgrade'; // Default to 'upgrade' if the period is not 'month' or 'year'
  }
};

const ChooseOffer = () => {
  const checkoutController = getModule(CheckoutController);
  const accountController = getModule(AccountController);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  const { setOffer } = useCheckoutStore(({ setOffer }) => ({ setOffer }), shallow);
  const { isLoading, offerType, setOfferType, offers, offersDict, defaultOfferId } = useOffers();
  const { subscription } = useAccountStore.getState();
  const [offerSwitches, updateOffer] = useCheckoutStore((state) => [state.offerSwitches, state.updateOffer]);
  const isOfferSwitch = useQueryParam('u') === 'upgrade-subscription';
  const availableOffers = isOfferSwitch ? offerSwitches : offers;
  const offerId = availableOffers[0]?.offerId || '';

  const updateAccountModal = useEventCallback((modal: keyof AccountModals) => {
    navigate(modalURLFromLocation(location, modal));
  });

  const chooseOfferSubmitHandler: UseFormOnSubmitHandler<ChooseOfferFormData> = useCallback(
    async ({ offerId }, { setSubmitting, setErrors }) => {
      const offer = offerId && offersDict[offerId];

      if (!offer) return setErrors({ form: t('choose_offer.offer_not_found') });

      if (isOfferSwitch) {
        const targetOffer = offerSwitches.find((offer) => offer.offerId === offerId);
        const targetOfferId = targetOffer?.offerId || '';

        try {
          await checkoutController.switchSubscription(targetOfferId, determineSwitchDirection(subscription));
          // switching a subscription takes a bit longer to process
          await accountController.reloadSubscriptions({ delay: 7500 });

          const isPendingSwitch = !!useAccountStore.getState().pendingOffer;

          updateAccountModal(isPendingSwitch ? 'upgrade-subscription-pending' : 'upgrade-subscription-success');
        } catch (error: unknown) {
          logDev('Error occurred while upgrading subscription', error);
          updateAccountModal('upgrade-subscription-error');
        }
      } else {
        const selectedOffer = availableOffers?.find((offer) => offer.offerId === offerId) || null;

        setOffer(selectedOffer);
        updateOffer(selectedOffer);
        setSubmitting(false);
        updateAccountModal('checkout');
      }
    },
    [
      availableOffers,
      isOfferSwitch,
      offerSwitches,
      offersDict,
      setOffer,
      subscription,
      t,
      updateAccountModal,
      updateOffer,
      checkoutController,
      accountController,
    ],
  );

  const { handleSubmit, handleChange, setValue, values, errors, submitting } = useForm<ChooseOfferFormData>({
    initialValues: { offerId: defaultOfferId },
    validationSchema: object().shape({ offerId: mixed<string>().required(t('choose_offer.field_required')) }),
    onSubmit: chooseOfferSubmitHandler,
  });

  useEffect(() => {
    if (!isOfferSwitch && !isLoading) setValue('offerId', defaultOfferId);

    // Update offerId if the user is switching offers to ensure the correct offer is checked in the ChooseOfferForm
    // Initially, a defaultOfferId is set, but when switching offers, we need to use the id of the target offer
    if (isOfferSwitch && values.offerId === defaultOfferId) {
      setValue('offerId', offerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, defaultOfferId, availableOffers]);

  // loading state
  if (isLoading) {
    return (
      <div style={{ height: 300 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return (
    <ChooseOfferForm
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitting={submitting}
      offers={availableOffers}
      offerType={offerType}
      setOfferType={setOfferType}
    />
  );
};

export default ChooseOffer;
