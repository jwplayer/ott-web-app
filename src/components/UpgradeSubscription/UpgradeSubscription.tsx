import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './UpgradeSubscription.module.scss';

import Button from '#components/Button/Button';

type Props = {
  type: 'error' | 'success';
  onCloseButtonClick: () => void;
};

const UpgradeSubscription: React.FC<Props> = ({ type, onCloseButtonClick }: Props) => {
  const { t } = useTranslation('account');
  return (
    <div>
      <h2 className={styles.title}>{type === 'success' ? t('checkout.upgrade_success') : t('checkout.upgrade_error')}</h2>
      <p className={styles.message}>{type === 'success' ? t('checkout.upgrade_success_message') : t('checkout.upgrade_error_message')}</p>
      <div>
        <Button label={t('checkout.close')} onClick={onCloseButtonClick} color="primary" variant="contained" size="large" fullWidth />
      </div>
    </div>
  );
};

export default UpgradeSubscription;
