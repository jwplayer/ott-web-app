import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import useCheckAccess from '@jwp/ott-hooks-react/src/useCheckAccess';
import { addQueryParam } from '@jwp/ott-common/src/utils/location';

import Spinner from '../Spinner/Spinner';

import styles from './WaitingForPayment.module.scss';

const WaitingForPayment = () => {
  const { t } = useTranslation('account');
  const location = useLocation();
  const navigate = useNavigate();
  const { intervalCheckAccess, errorMessage } = useCheckAccess();

  useEffect(() => {
    intervalCheckAccess({
      interval: 3000,
      iterations: 5,
      callback: (hasAccess) => hasAccess && navigate(addQueryParam(location, 'u', 'welcome')),
    });
    //eslint-disable-next-line
  }, []);
  return (
    <div className={styles.center}>
      {errorMessage ? (
        <h2>{errorMessage}</h2>
      ) : (
        <>
          <Spinner />
          <h2>{t('checkout.waiting_for_payment')}</h2>
        </>
      )}
    </div>
  );
};

export default WaitingForPayment;
