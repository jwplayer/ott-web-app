import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';

import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';
import { modalURLFromLocation } from '../../utils/location';
import { useAriaAnnouncer } from '../../containers/AnnouncementProvider/AnnoucementProvider';

import styles from './FinalizePayment.module.scss';

const FinalizePayment = () => {
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);

  const { t } = useTranslation('account');
  const announce = useAriaAnnouncer();
  const navigate = useNavigate();
  const location = useLocation();

  const { accessModel } = useConfigStore(({ accessModel }) => ({ accessModel }));
  const [searchParams] = useSearchParams();
  const redirectResult = searchParams.get('redirectResult');
  const orderIdQueryParam = searchParams.get('orderId');

  const [errorMessage, setErrorMessage] = useState<string>();

  const paymentSuccessUrl = useMemo(() => {
    return modalURLFromLocation(location, accessModel === ACCESS_MODEL.SVOD ? 'welcome' : null);
  }, [accessModel, location]);

  const checkPaymentResult = useEventCallback(async (redirectResult: string) => {
    const orderId = orderIdQueryParam ? parseInt(orderIdQueryParam, 10) : undefined;

    try {
      await checkoutController.finalizeAdyenPayment({ redirectResult: decodeURI(redirectResult) }, orderId);
      await accountController.reloadSubscriptions({ retry: 10 });

      announce(t('checkout.payment_success'), 'success');
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
            onClick={() => navigate(modalURLFromLocation(location, 'checkout'))}
            fullWidth
          />
        </>
      ) : (
        <div>
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default FinalizePayment;
