import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './SubscriptionCancelled.module.scss';

import Button from '#components/Button/Button';

type Props = {
  expiresDate: string;
  onClose: () => void;
};

const SubscriptionCancelled: React.FC<Props> = ({ expiresDate, onClose }: Props) => {
  const { t } = useTranslation('account');

  return (
    <div className={styles.SubscriptionCancelled}>
      <h2 className={styles.title}>{t('subscription_cancelled.title')}</h2>
      <p className={styles.paragraph}>{t('subscription_cancelled.message', { date: expiresDate })}</p>
      <Button label={t('subscription_cancelled.return_to_profile')} variant="outlined" onClick={onClose} fullWidth />
    </div>
  );
};

export default SubscriptionCancelled;
