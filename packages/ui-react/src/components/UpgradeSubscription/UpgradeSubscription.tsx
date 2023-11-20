import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';

import styles from './UpgradeSubscription.module.scss';

type Props = {
  type: 'error' | 'success' | 'pending';
  onCloseButtonClick: () => void;
};

const UpgradeSubscription: React.FC<Props> = ({ type, onCloseButtonClick }: Props) => {
  const { t } = useTranslation('account');

  // these comments exist for extracting dynamic i18n keys
  // t('account:checkout.upgrade_success');
  // t('account:checkout.upgrade_success_message');
  // t('account:checkout.upgrade_pending');
  // t('account:checkout.upgrade_pending_message');
  // t('account:checkout.upgrade_error');
  // t('account:checkout.upgrade_error_message');
  const title = t(`checkout.upgrade_${type}`);
  const message = t(`checkout.upgrade_${type}_message`);

  return (
    <div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      <div>
        <Button label={t('checkout.close')} onClick={onCloseButtonClick} color="primary" variant="contained" size="large" fullWidth />
      </div>
    </div>
  );
};

export default UpgradeSubscription;
