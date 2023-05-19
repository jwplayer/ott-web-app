import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import useQueryParam from '../../hooks/useQueryParam';
import { removeQueryParam } from '../../utils/location';
import { finalizeAdyenPayment } from '../../stores/CheckoutController';
import { useConfigStore } from '../../stores/ConfigStore';
import Button from '../Button/Button';
import { reloadActiveSubscription } from '../../stores/AccountController';
import useEventCallback from '../../hooks/useEventCallback';
import Spinner from '../Spinner/Spinner';
import { addQueryParams } from '../../utils/formatting';

import styles from './FinalizePayment.module.scss';

const FinalizePayment = () => {
  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const location = useLocation();

  const { accessModel } = useConfigStore(({ accessModel }) => ({ accessModel }));
  const redirectResult = useQueryParam('redirectResult');
  const orderIdQueryParam = useQueryParam('orderId');

  const [errorMessage, setErrorMessage] = useState<string>();
  const [processing, setProcessing] = useState(false);

  const paymentSuccessUrl = useMemo(() => {
    return accessModel === 'SVOD' ? addQueryParams(window.origin, { u: 'welcome' }) : removeQueryParam(location, 'u');
  }, [accessModel, location]);

  const checkPaymentResult = useEventCallback(async (redirectResult: string) => {
    setProcessing(true);

    const orderId = orderIdQueryParam ? parseInt(orderIdQueryParam, 10) : undefined;

    try {
      await finalizeAdyenPayment({ redirectResult: decodeURI(redirectResult) }, orderId);
      await reloadActiveSubscription({ delay: 2000 });

      navigate(paymentSuccessUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }

    setProcessing(false);
  });

  useEffect(() => {
    if (!redirectResult) return;

    checkPaymentResult(redirectResult);
  }, [checkPaymentResult, redirectResult]);

  return (
    <div className={styles.container}>
      {processing ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : (
        <>
          <h2 className={styles.title}>{errorMessage}</h2>
          <Button
            label={t('checkout.go_back_to_checkout')}
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(addQueryParams(window.origin, { u: 'checkout' }))}
            fullWidth
          />
        </>
      )}
    </div>
  );
};

export default FinalizePayment;
