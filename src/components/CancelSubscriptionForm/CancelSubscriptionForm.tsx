import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './CancelSubscriptionForm.module.scss';

import Button from '#components/Button/Button';
import FormFeedback from '#components/FormFeedback/FormFeedback';

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  error: string | null;
  submitting: boolean;
};

const CancelSubscriptionForm: React.FC<Props> = ({ onConfirm, onCancel, error, submitting }: Props) => {
  const { t } = useTranslation('account');

  return (
    <div>
      {error ? <FormFeedback variant="error">{error}</FormFeedback> : null}
      <h2 className={styles.title}>{t('cancel_subscription.title')}</h2>
      <p className={styles.paragraph}>{t('cancel_subscription.explanation')}</p>
      <Button
        className={styles.confirmButton}
        label={t('cancel_subscription.unsubscribe')}
        color="primary"
        variant="contained"
        onClick={onConfirm}
        fullWidth
        disabled={submitting}
      />
      <Button label={t('cancel_subscription.no_thanks')} variant="outlined" onClick={onCancel} fullWidth />
    </div>
  );
};

export default CancelSubscriptionForm;
