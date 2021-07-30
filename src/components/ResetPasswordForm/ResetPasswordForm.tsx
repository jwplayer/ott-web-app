import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';

import styles from './ResetPasswordForm.module.scss';

type Props = {
  onCancel: () => void;
  onReset: () => void;
};

const ResetPasswordForm: React.FC<Props> = ({ onCancel, onReset }: Props) => {
  const { t } = useTranslation('account');
  return (
    <div className={styles.resetPassword}>
      <h5 className={styles.title}>{t('reset.reset_password')}</h5>
      <p className={styles.text}>{t('reset.text')}</p>
      <Button onClick={onCancel} className={styles.button} fullWidth color="primary" label={t('reset.yes')} />
      <Button onClick={onReset} fullWidth label={t('reset.no')} />
    </div>
  );
};

export default ResetPasswordForm;
