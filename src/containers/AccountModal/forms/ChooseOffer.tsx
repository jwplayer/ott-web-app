import React, { useEffect } from 'react';
import { mixed, object, SchemaOf } from 'yup';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';

import { addQueryParam, removeQueryParam } from '#src/utils/history';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { getOffer } from '#src/services/checkout.service';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import ChooseOfferForm from '#src/components/ChooseOfferForm/ChooseOfferForm';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import type { ChooseOfferFormData, OfferPeriodicity } from '#types/account';

const ChooseOffer = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { useSandbox, monthlyOffer, yearlyOffer } = config?.integrations?.cleeng || {};
  const hasOffer = accessModel === 'SVOD';
  const { offer, setOffer } = useCheckoutStore(({ offer, setOffer }) => ({ offer, setOffer }), shallow);

  const cleengMonthlyOffer = monthlyOffer as string;
  const cleengYearlyOffer = yearlyOffer as string;

  // `useQueries` is not strongly typed :-(
  const { data: monthlyOfferData } = useQuery(['offer', cleengMonthlyOffer], () => getOffer({ offerId: cleengMonthlyOffer }, Boolean(useSandbox)));
  const { data: yearlyOfferData } = useQuery(['offer', cleengYearlyOffer], () => getOffer({ offerId: cleengYearlyOffer }, Boolean(useSandbox)));

  useEffect(() => {
    // close auth modal when there are no offers defined in the config
    if (!hasOffer) history.replace(removeQueryParam(history, 'u'));
  }, [hasOffer, history]);

  const chooseOfferSubmitHandler: UseFormOnSubmitHandler<ChooseOfferFormData> = async (formData, { setSubmitting, setErrors }) => {
    const offer = formData.periodicity === 'monthly' ? monthlyOfferData?.responseData : yearlyOfferData?.responseData;

    if (!offer) {
      return setErrors({ form: t('choose_offer.offer_not_found') });
    }

    setOffer(offer);

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
