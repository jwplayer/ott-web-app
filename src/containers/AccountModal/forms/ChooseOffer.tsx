import React, { useContext } from 'react';
import { object, SchemaOf, mixed } from 'yup';
import type { ChooseOfferFormData, OfferPeriodicity } from 'types/account';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router';

import useForm, { UseFormOnSubmitHandler } from '../../../hooks/useForm';
import ChooseOfferForm from '../../../components/ChooseOfferForm/ChooseOfferForm';
import { getOffer } from '../../../services/checkout.service';
import { ConfigContext } from '../../../providers/ConfigProvider';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import { CheckoutStore } from '../../../stores/CheckoutStore';
import { addQueryParam } from '../../../utils/history';

const ChooseOffer = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const { cleengSandbox, json } = useContext(ConfigContext);
  const offer = CheckoutStore.useState(s => s.offer);

  const cleengMonthlyOffer = json?.cleengMonthlyOffer as string;
  const cleengYearlyOffer = json?.cleengYearlyOffer as string;

  // `useQueries` is not strongly typed :-(
  const { data: monthlyOfferData } = useQuery(['offer', cleengMonthlyOffer], () => getOffer({ offerId: cleengMonthlyOffer }, cleengSandbox));
  const { data: yearlyOfferData } = useQuery(['offer', cleengYearlyOffer], () => getOffer({ offerId: cleengYearlyOffer }, cleengSandbox));

  const chooseOfferSubmitHandler: UseFormOnSubmitHandler<ChooseOfferFormData> = async (formData, { setSubmitting, setErrors }) => {
    const offer = formData.periodicity === 'monthly' ? monthlyOfferData?.responseData : yearlyOfferData?.responseData;

    if (!offer) {
      return setErrors({ form: 'Something went wrong...' });
    }

    try {
      CheckoutStore.update(s => {
        s.offer = offer;
      })

      history.push(addQueryParam(history, 'u', 'checkout'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        // @todo translate error message
        setErrors({ form: error.message });
        console.info('Create order error', error);
      }
    }

    setSubmitting(false);
  };

  const validationSchema: SchemaOf<ChooseOfferFormData> = object().shape({
    periodicity: mixed<OfferPeriodicity>().required(t('choose_offer.field_required')),
  });
  const initialValues: ChooseOfferFormData = { periodicity: offer?.period === 'year' ? 'yearly' : 'monthly' };
  const { handleSubmit, handleChange, values, errors, submitting } = useForm(initialValues, chooseOfferSubmitHandler, validationSchema);

  // loading state
  if (!monthlyOfferData?.responseData || !yearlyOfferData?.responseData) {
    return <div style={{ height: 300 }}><LoadingOverlay inline /></div>;
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
