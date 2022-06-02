import React, { useEffect } from 'react';
import { mixed, object, SchemaOf } from 'yup';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';

import useOffers from '../../../hooks/useOffers';

import { addQueryParam, removeQueryParam } from '#src/utils/history';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import ChooseOfferForm from '#src/components/ChooseOfferForm/ChooseOfferForm';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import type { ChooseOfferFormData } from '#types/account';

const ChooseOffer = () => {
  const history = useHistory();
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
    history.push(addQueryParam(history, 'u', 'checkout'));
  };

  const { handleSubmit, handleChange, setValue, values, errors, submitting } = useForm(initialValues, chooseOfferSubmitHandler, validationSchema);

  useEffect(() => {
    // close auth modal when there are no offers defined in the config
    if (!isLoading && !offers.length) history.replace(removeQueryParam(history, 'u'));
  }, [isLoading, offers, history]);

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
