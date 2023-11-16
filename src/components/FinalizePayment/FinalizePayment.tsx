import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import styles from './FinalizePayment.module.scss';

import Button from '#components/Button/Button';
import Spinner from '#components/Spinner/Spinner';
import useEventCallback from '#src/hooks/useEventCallback';
import { useConfigStore } from '#src/stores/ConfigStore';
import { replaceQueryParam, removeQueryParam, addQueryParam } from '#src/utils/location';
import AccountController from '#src/stores/AccountController';
import CheckoutController from '#src/stores/CheckoutController';
import { ACCESS_MODEL } from '#src/config';
import { getModule } from '#src/modules/container';

const FinalizePayment = () => {
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);

  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const location = useLocation();

  const { accessModel } = useConfigStore(({ accessModel }) => ({ accessModel }));
  const [searchParams] = useSearchParams();
  const redirectResult = searchParams.get('redirectResult');
  const orderIdQueryParam = searchParams.get('orderId');

  const [errorMessage, setErrorMessage] = useState<string>();

  const paymentSuccessUrl = useMemo(() => {
    return accessModel === ACCESS_MODEL.SVOD ? replaceQueryParam(location, 'u', 'welcome') : removeQueryParam(location, 'u');
  }, [accessModel, location]);

  const checkPaymentResult = useEventCallback(async (redirectResult: string) => {
    const orderId = orderIdQueryParam ? parseInt(orderIdQueryParam, 10) : undefined;

    try {
      await checkoutController.finalizeAdyenPayment({ redirectResult: decodeURI(redirectResult) }, orderId);
      await accountController.reloadActiveSubscription({ delay: 2000 });

      navigate(paymentSuccessUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  });

  useEffect(() => {
    if (!redirectResult) return;

    checkPaymentResult(redirectResult);
  }, [checkPaymentResult, redirectResult]);

  return (
    <div className={styles.container}>
      {errorMessage ? (
        <>
          <h2 className={styles.title}>{errorMessage}</h2>
          <Button
            label={t('checkout.go_back_to_checkout')}
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(addQueryParam(location, 'u', 'checkout'))}
            fullWidth
          />
        </>
      ) : (
        <div className={styles.loading}>
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default FinalizePayment;
