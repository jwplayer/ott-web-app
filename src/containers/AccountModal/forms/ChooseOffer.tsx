import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { mixed, object, SchemaOf } from 'yup';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';

import useOffers from '../../../hooks/useOffers';

import { addQueryParam, removeQueryParam } from '#src/utils/history';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import ChooseOfferForm from '#src/components/ChooseOfferForm/ChooseOfferForm';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import type { ChooseOfferFormData, OfferType } from '#types/account';

const ChooseOffer = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const { setOffer } = useCheckoutStore(({ setOffer }) => ({ setOffer }), shallow);
  const { tvodOffers, yearlyOffer, monthlyOffer, hasPremierOffer, isLoadingOffers } = useOffers();
  const allOffers = useMemo(() => [yearlyOffer, monthlyOffer, ...tvodOffers], [yearlyOffer, monthlyOffer, tvodOffers]);
  const [offerType, updateOfferType] = useState<OfferType>('svod');

  const validationSchema: SchemaOf<ChooseOfferFormData> = object().shape({
    offerId: mixed<string>().required(t('choose_offer.field_required')),
  });

  const initialValues: ChooseOfferFormData = {
    offerId: yearlyOffer?.offerId || monthlyOffer?.offerId || allOffers?.[0]?.offerId,
  };

  const chooseOfferSubmitHandler: UseFormOnSubmitHandler<ChooseOfferFormData> = async ({ offerId }, { setSubmitting, setErrors }) => {
    const offer = allOffers.find((offer) => offer?.offerId === offerId);

    if (!offer) return setErrors({ form: t('choose_offer.offer_not_found') });

    setOffer(offer);
    setSubmitting(false);
    history.push(addQueryParam(history, 'u', 'checkout'));
  };

  const { handleSubmit, handleChange, setValue, values, errors, submitting } = useForm(initialValues, chooseOfferSubmitHandler, validationSchema);

  const setOfferType = useCallback(
    (offerType: OfferType) => {
      updateOfferType(offerType);

      const offerId = offerType === 'tvod' ? tvodOffers?.[0]?.offerId : yearlyOffer?.offerId || monthlyOffer?.offerId || '';
      setValue('offerId', offerId);
    },
    [setValue, tvodOffers, monthlyOffer, yearlyOffer],
  );

  useEffect(() => {
    // close auth modal when there are no offers defined in the config
    if (!isLoadingOffers && !allOffers.length) history.replace(removeQueryParam(history, 'u'));
  }, [isLoadingOffers, allOffers, history]);

  useEffect(() => {
    if (isLoadingOffers) return;
    if ((yearlyOffer || monthlyOffer) && !hasPremierOffer) return;

    // If there is a premium offer, or no montly and yearly: switch to tvod
    setOfferType('tvod');
  }, [isLoadingOffers, yearlyOffer, monthlyOffer, hasPremierOffer, setOfferType]);

  // loading state
  if (!allOffers.length || isLoadingOffers) {
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
      monthlyOffer={monthlyOffer}
      yearlyOffer={yearlyOffer}
      tvodOffers={tvodOffers}
      offerType={offerType}
      setOfferType={setOfferType}
    />
  );
};

export default ChooseOffer;
