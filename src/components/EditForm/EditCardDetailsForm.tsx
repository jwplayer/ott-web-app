import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';

import styles from './EditCardDetailsForm.module.scss';

import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';

type Props = {
  renderPaymentMethod?: () => JSX.Element | null;
  submitting: boolean;
  onCancel: () => void;
};

const EditCardDetailsForm: React.FC<Props> = ({ renderPaymentMethod, submitting, onCancel }) => {
  const { t } = useTranslation('common');
  return (
    <div>
      <div className={styles.title}>
        <h1>Add card details</h1>
      </div>
      <div>{renderPaymentMethod ? renderPaymentMethod() : null}</div>
      {submitting && <LoadingOverlay transparentBackground inline />}
      <Button onClick={onCancel} className={styles.cancelButton} fullWidth label={t('confirmation_dialog.close')} />
    </div>
  );
};

export default EditCardDetailsForm;
