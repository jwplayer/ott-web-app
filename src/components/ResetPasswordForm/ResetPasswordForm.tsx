import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ResetPasswordForm.module.scss';

import Button from '#components/Button/Button';

type Props = {
  onCancel: () => void;
  onReset: () => void;
  submitting: boolean;
};

const ResetPasswordForm: React.FC<Props> = ({ onCancel, onReset, submitting }: Props) => {
  const { t } = useTranslation('account');
  return (
    <div className={styles.resetPassword}>
      <h5 className={styles.title}>{t('reset.reset_password')}</h5>
      <p className={styles.text}>{t('reset.text')}</p>
      <Button onClick={onReset} className={styles.button} fullWidth color="primary" label={t('reset.yes')} disabled={submitting} />
      <Button onClick={onCancel} fullWidth label={t('reset.no')} />
    </div>
  );
};

export default ResetPasswordForm;
