import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';
import useCountdown from '../../hooks/useCountdown';
import { ConfigStore } from '../../stores/ConfigStore';

import styles from './Welcome.module.scss';

type Props = {
  onCloseButtonClick?: () => void;
  onCountdownCompleted?: () => void;
};

const Welcome: React.FC<Props> = ({ onCloseButtonClick, onCountdownCompleted }) => {
  const { t } = useTranslation('account');
  const config = ConfigStore.useState(s => s.config);
  const countdown = useCountdown(10, 1, onCountdownCompleted);

  return (
    <div className={styles.welcome}>
      <h2>{t('checkout.welcome_title', { siteName: config.siteName })}</h2>
      <p>{t('checkout.welcome_description', { siteName: config.siteName })}</p>
      <Button variant="contained" color="primary" label={t('checkout.start_watching', { countdown })} onClick={onCloseButtonClick} size="large" fullWidth />
    </div>
  );
};

export default Welcome;
