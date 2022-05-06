import React, { useEffect } from 'react';
import { object, SchemaOf, mixed } from 'yup';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router';

import useForm, { UseFormOnSubmitHandler } from '../../../hooks/useForm';
import ChooseOfferForm from '../../../components/ChooseOfferForm/ChooseOfferForm';
import { getOffer } from '../../../services/checkout.service';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import { CheckoutStore } from '../../../stores/CheckoutStore';
import { addQueryParam, removeQueryParam } from '../../../utils/history';
import { ConfigStore } from '../../../stores/ConfigStore';

import type { ChooseOfferFormData, OfferPeriodicity } from '#types/account';

const ChooseOffer = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const config = ConfigStore.useState((s) => s.config);
  const { cleengSandbox, json } = config;
  const accessModel = ConfigStore.useState((s) => s.accessModel);
  const hasOffer = accessModel === 'SVOD';
  const offer = CheckoutStore.useState((s) => s.offer);

  const cleengMonthlyOffer = json?.cleengMonthlyOffer as string;
  const cleengYearlyOffer = json?.cleengYearlyOffer as string;

  // `useQueries` is not strongly typed :-(
  const { data: monthlyOfferData } = useQuery(['offer', cleengMonthlyOffer], () => getOffer({ offerId: cleengMonthlyOffer }, cleengSandbox));
  const { data: yearlyOfferData } = useQuery(['offer', cleengYearlyOffer], () => getOffer({ offerId: cleengYearlyOffer }, cleengSandbox));

  useEffect(() => {
    // close auth modal when there are no offers defined in the config
    if (!hasOffer) history.replace(removeQueryParam(history, 'u'));
  }, [hasOffer, history]);

  const chooseOfferSubmitHandler: UseFormOnSubmitHandler<ChooseOfferFormData> = async (formData, { setSubmitting, setErrors }) => {
    const offer = formData.periodicity === 'monthly' ? monthlyOfferData?.responseData : yearlyOfferData?.responseData;

    if (!offer) {
      return setErrors({ form: t('choose_offer.offer_not_found') });
    }

    CheckoutStore.update((s) => {
      s.offer = offer;
    });

    history.push(addQueryParam(history, 'u', 'checkout'));

    setSubmitting(false);
  };

  const validationSchema: SchemaOf<ChooseOfferFormData> = object().shape({
    periodicity: mixed<OfferPeriodicity>().required(t('choose_offer.field_required')),
  });
  const initialValues: ChooseOfferFormData = { periodicity: offer?.period === 'month' ? 'monthly' : 'yearly' };
  const { handleSubmit, handleChange, values, errors, submitting } = useForm(initialValues, chooseOfferSubmitHandler, validationSchema);

  // loading state
  if (!hasOffer || !monthlyOfferData?.responseData || !yearlyOfferData?.responseData) {
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
      monthlyOffer={monthlyOfferData.responseData}
      yearlyOffer={yearlyOfferData.responseData}
    />
  );
};

export default ChooseOffer;
