import React, { useEffect } from 'react';
import { mixed, object, SchemaOf } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import shallow from 'zustand/shallow';

import useOffers from '#src/hooks/useOffers';
import { addQueryParam, removeQueryParam } from '#src/utils/location';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import ChooseOfferForm from '#components/ChooseOfferForm/ChooseOfferForm';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import type { ChooseOfferFormData } from '#types/account';

const ChooseOffer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  const { setOffer } = useCheckoutStore(({ setOffer }) => ({ setOffer }), shallow);
  const { accessModel } = useConfigStore(({ accessModel }) => ({ accessModel }), shallow);
  const { isLoading, offerType, setOfferType, offers, offersDict, defaultOfferId, hasTVODOffers, hasPremierOffer } = useOffers();

  const validationSchema: SchemaOf<ChooseOfferFormData> = object().shape({
    offerId: mixed<string>().required(t('choose_offer.field_required')),
  });

  const initialValues: ChooseOfferFormData = {
    offerId: defaultOfferId,
  };

  const chooseOfferSubmitHandler: UseFormOnSubmitHandler<ChooseOfferFormData> = async ({ offerId }, { setSubmitting, setErrors }) => {
    const offer = offerId && offersDict[offerId];

    if (!offer) return setErrors({ form: t('choose_offer.offer_not_found') });

    setOffer(offer);
    setSubmitting(false);
    navigate(addQueryParam(location, 'u', 'checkout'));
  };

  const { handleSubmit, handleChange, setValue, values, errors, submitting } = useForm(initialValues, chooseOfferSubmitHandler, validationSchema);

  useEffect(() => {
    // close auth modal when there are no offers defined in the config
    if (!isLoading && !offers.length) navigate(removeQueryParam(location, 'u'), { replace: true });
  }, [isLoading, offers, location, navigate]);

  useEffect(() => {
    setValue('offerId', defaultOfferId);
  }, [setValue, defaultOfferId]);

  // loading state
  if (!offers.length || isLoading) {
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
      offers={offers}
      offerType={offerType}
      setOfferType={accessModel === 'SVOD' && hasTVODOffers && !hasPremierOffer ? setOfferType : undefined}
    />
  );
};

export default ChooseOffer;
