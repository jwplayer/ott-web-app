import React, { useMemo, useState } from 'react';
import type { PaymentProvider } from '@jwp/ott-common/types/checkout';

import Spinner from '../Spinner/Spinner';

import FinalizeAdyenPayment from './FinalizeAdyenPayment';
import FinalizeStripePpvPayment from './FinalizeStripePpvPayment';
import styles from './FinalizePayment.module.scss';

type FinalizePaymentProps = { type: PaymentProvider };

const FinalizePayment = ({ type }: FinalizePaymentProps) => {
  const [isInProgress, setIsInProgress] = useState(true);

  return (
    <div className={styles.container}>
      {useMemo(() => {
        switch (type) {
          case 'adyen':
            return <FinalizeAdyenPayment onError={() => setIsInProgress(false)} />;
          case 'stripe':
            return <FinalizeStripePpvPayment />;
          default:
            return null;
        }
      }, [type])}
      {isInProgress && (
        <div>
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default FinalizePayment;
