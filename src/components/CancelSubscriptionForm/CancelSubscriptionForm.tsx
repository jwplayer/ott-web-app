import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';
import FormFeedback from '../FormFeedback/FormFeedback';

import styles from './CancelSubscriptionForm.module.scss';

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  error: string | null;
};

const CancelSubscriptionForm: React.FC<Props> = ({ onConfirm, onCancel, error }: Props) => {
  const { t } = useTranslation('account');

  return (
    <div>
      {error ? <FormFeedback variant="error">{error}</FormFeedback> : null}
      <h2 className={styles.title}>{t('cancel_subscription.title')}</h2>
      <p className={styles.paragraph}>
        {t('cancel_subscription.explanation')}
      </p>
      <Button className={styles.confirmButton} label="Unsubscribe" color="primary" variant="contained" onClick={onConfirm} fullWidth />
      <Button label="No, thanks" variant="outlined" onClick={onCancel} fullWidth />
    </div>
  );
};

export default CancelSubscriptionForm;
