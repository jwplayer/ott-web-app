import React, { useEffect, useMemo } from 'react';
import { mixed, object, SchemaOf } from 'yup';
import { useTranslation } from 'react-i18next';
import { useQueries, useQuery } from 'react-query';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';

import { addQueryParam, removeQueryParam } from '#src/utils/history';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { getOffer } from '#src/services/checkout.service';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import ChooseOfferForm from '#src/components/ChooseOfferForm/ChooseOfferForm';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import type { ChooseOfferFormData, OfferPeriodicity, OfferType } from '#types/account';
import type { Offer } from '#types/checkout';

const ChooseOffer = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { cleengSandbox, json } = config;
  const { offer, setOffer } = useCheckoutStore(({ offer, setOffer }) => ({ offer, setOffer }), shallow);

  const cleengMonthlyOffer = json?.cleengMonthlyOffer as string;
  const cleengYearlyOffer = json?.cleengYearlyOffer as string;

  const { requestedMediaOffers } = useCheckoutStore(({ requestedMediaOffers }) => ({ requestedMediaOffers: requestedMediaOffers || [] }));

  // `useQueries` is not strongly typed :-(
  const { data: monthlyOfferData } = useQuery(['offer', cleengMonthlyOffer], () => getOffer({ offerId: cleengMonthlyOffer }, cleengSandbox));
  const { data: yearlyOfferData } = useQuery(['offer', cleengYearlyOffer], () => getOffer({ offerId: cleengYearlyOffer }, cleengSandbox));

  const tvodOfferQueries = useQueries(
    requestedMediaOffers?.map(({ offerId }) => ({
      queryKey: ['requestedMediaOffer', offerId],
      queryFn: () => getOffer({ offerId }, cleengSandbox),
      enabled: !!offerId,
    })),
  );

  const tvodOffers = useMemo(
    () => tvodOfferQueries.reduce<Offer[]>((prev, cur) => (cur.isSuccess && cur.data?.responseData ? [...prev, cur.data.responseData] : prev), []),
    [tvodOfferQueries],
  );

  const hasOffer = accessModel === 'SVOD' || requestedMediaOffers.length;

  useEffect(() => {
    // close auth modal when there are no offers defined in the config
    if (!hasOffer) history.replace(removeQueryParam(history, 'u'));
  }, [hasOffer, history]);

  const chooseOfferSubmitHandler: UseFormOnSubmitHandler<ChooseOfferFormData> = async (formData, { setSubmitting, setErrors }) => {
    const offer =
      formData.offerType === 'svod'
        ? formData.periodicity === 'monthly'
          ? monthlyOfferData?.responseData
          : yearlyOfferData?.responseData
        : tvodOffers.find(({ offerId }) => offerId === formData.tvodOfferId);

    if (!offer) {
      return setErrors({ form: t('choose_offer.offer_not_found') });
    }

    setOffer(offer);

    history.push(addQueryParam(history, 'u', 'checkout'));

    setSubmitting(false);
  };

  const validationSchema: SchemaOf<ChooseOfferFormData> = object().shape({
    offerType: mixed<OfferType>().required(t('choose_offer.field_required')),
    periodicity: mixed<OfferPeriodicity>().required(t('choose_offer.field_required')),
    tvodOfferId: mixed<string>(),
  });
  const initialValues: ChooseOfferFormData = {
    offerType: 'svod',
    periodicity: offer?.period === 'month' ? 'monthly' : 'yearly',
    tvodOfferId: requestedMediaOffers[0]?.offerId,
  };
  const { handleSubmit, handleChange, values, errors, submitting } = useForm(initialValues, chooseOfferSubmitHandler, validationSchema);

  // loading state
  if (!hasOffer || ((!monthlyOfferData?.responseData || !yearlyOfferData?.responseData) && !tvodOffers.length)) {
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
      monthlyOffer={monthlyOfferData?.responseData}
      yearlyOffer={yearlyOfferData?.responseData}
      tvodOffers={tvodOffers}
    />
  );
};

export default ChooseOffer;
