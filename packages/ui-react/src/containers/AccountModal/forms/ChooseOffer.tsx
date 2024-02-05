import React, { useEffect } from 'react';
import { mixed, object } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import type { ChooseOfferFormData, OfferType } from '@jwp/ott-common/types/checkout';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useOffers from '@jwp/ott-hooks-react/src/useOffers';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';

import ChooseOfferForm from '../../../components/ChooseOfferForm/ChooseOfferForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import useQueryParam from '../../../hooks/useQueryParam';

const ChooseOffer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  const isSwitch = useQueryParam('u') === 'upgrade-subscription';
  const isPendingOffer = useAccountStore(({ pendingOffer }) => ({ isPendingOffer: !!pendingOffer }));

  const { isLoading, mediaOffers, subscriptionOffers, switchSubscriptionOffers, defaultOfferType, hasMultipleOfferTypes, chooseOffer, switchSubscription } =
    useOffers();

  const checkoutUrl = modalURLFromLocation(location, 'checkout');
  const upgradePendingUrl = modalURLFromLocation(location, 'upgrade-subscription-pending');
  const upgradeSuccessUrl = modalURLFromLocation(location, 'upgrade-subscription-success');
  const upgradeErrorUrl = modalURLFromLocation(location, 'upgrade-subscription-error');

  const { values, errors, submitting, setValue, handleSubmit, handleChange } = useForm<ChooseOfferFormData>({
    initialValues: { selectedOfferType: defaultOfferType, selectedOfferId: undefined },
    validationSchema: object().shape({
      selectedOfferId: mixed<string>().required(t('choose_offer.field_required')),
      selectedOfferType: mixed<OfferType>().required(t('choose_offer.field_required')),
    }),
    onSubmit: async ({ selectedOfferType, selectedOfferId }) => {
      if (!selectedOfferType || !selectedOfferId) return;

      const offer = visibleOffers.find((offer) => offer.offerId === selectedOfferId);

      if (!offer) return;

      await chooseOffer.mutateAsync(offer);

      if (isSwitch) {
        return await switchSubscription.mutateAsync();
      }
    },
    onSubmitSuccess: async () => {
      if (isSwitch && isPendingOffer) return navigate(upgradePendingUrl);
      if (isSwitch) return navigate(upgradeSuccessUrl);

      navigate(checkoutUrl);
    },
    onSubmitError: () => navigate(upgradeErrorUrl),
  });

  const visibleOffers = values.selectedOfferType === 'tvod' ? mediaOffers : isSwitch ? switchSubscriptionOffers : subscriptionOffers;

  useEffect(() => {
    if (isLoading || !visibleOffers.length) return;

    const offerId = visibleOffers[visibleOffers.length - 1]?.offerId;

    setValue('selectedOfferId', offerId);
  }, [visibleOffers, values.selectedOfferType, setValue, isLoading]);

  useEffect(() => {
    if (isLoading || !defaultOfferType) return;

    setValue('selectedOfferType', defaultOfferType);
  }, [isLoading, defaultOfferType, setValue]);

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
      offers={visibleOffers}
      showOfferTypeSwitch={hasMultipleOfferTypes}
    />
  );
};

export default ChooseOffer;
