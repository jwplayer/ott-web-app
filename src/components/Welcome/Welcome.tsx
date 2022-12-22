import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Welcome.module.scss';

import Button from '#components/Button/Button';
import useCountdown from '#src/hooks/useCountdown';

type Props = {
  onCloseButtonClick?: () => void;
  onCountdownCompleted?: () => void;
  siteName?: string;
};

const Welcome: React.FC<Props> = ({ onCloseButtonClick, onCountdownCompleted, siteName }) => {
  const { t } = useTranslation('account');
  const countdown = useCountdown(10, 1, onCountdownCompleted);

  return (
    <div className={styles.welcome}>
      <h2>{t('checkout.welcome_title', { siteName })}</h2>
      <p>{t('checkout.welcome_description', { siteName })}</p>
      <Button variant="contained" color="primary" label={t('checkout.start_watching', { countdown })} onClick={onCloseButtonClick} size="large" fullWidth />
    </div>
  );
};

export default Welcome;
