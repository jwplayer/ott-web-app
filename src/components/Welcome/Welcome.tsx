import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Welcome.module.scss';

import Button from '#components/Button/Button';
import useCountdown from '#src/hooks/useCountdown';

type Props = {
  onCloseButtonClick?: () => void;
  onCountdownCompleted?: () => void;
  siteName?: string;
  hasPurchasedProduct?: boolean;
};

const Welcome: React.FC<Props> = ({ onCloseButtonClick, onCountdownCompleted, siteName, hasPurchasedProduct }) => {
  const { t } = useTranslation('account');
  const countdown = useCountdown(10, 1, onCountdownCompleted);

  return (
    <div className={styles.welcome}>
      <h2>{hasPurchasedProduct ? 'Thank you for your purchase.' : t('checkout.welcome_title', { siteName })}</h2>
      <p>{hasPurchasedProduct ? 'You will receive an email with additional info.' : t('checkout.welcome_description', { siteName })}</p>
      <Button
        variant="contained"
        color="primary"
        label={hasPurchasedProduct ? 'Continue watching' : t('checkout.start_watching', { countdown })}
        onClick={onCloseButtonClick}
        size="large"
        fullWidth
      />
    </div>
  );
};

export default Welcome;
