import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Spinner from '../Spinner/Spinner';

import styles from './WaitingForPayment.module.scss';

import useCheckAccess from '#src/hooks/useCheckAccess';

const WaitingForPayment = () => {
  const { t } = useTranslation('account');
  const { intervalCheckAccess, errorMessage } = useCheckAccess();
  useEffect(() => {
    intervalCheckAccess({
      interval: 3000,
      iterations: 5,
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
