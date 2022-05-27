import React, { useEffect } from 'react';
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
import type { ChooseOfferFormData } from '#types/account';

const ChooseOffer = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const { setOffer } = useCheckoutStore(({ setOffer }) => ({ setOffer }), shallow);
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
    setValue('offerId', offers[offers.length - 1]?.offerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerType, setValue]);

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
      setOfferType={hasTVODOffers && !hasPremierOffer ? setOfferType : undefined}
    />
  );
};

export default ChooseOffer;
