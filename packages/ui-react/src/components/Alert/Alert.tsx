import React from 'react';
import { useTranslation } from 'react-i18next';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import Dialog from '../Dialog/Dialog';
import Button from '../Button/Button';

import styles from './Alert.module.scss';

type Props = {
  open: boolean;
  message: string | null;
  onClose: () => void;
  isSuccess?: boolean;
  actionsOverride?: React.ReactNode;
  titleOverride?: string;
};

const Alert: React.FC<Props> = ({ open, message, onClose, isSuccess, actionsOverride, titleOverride }: Props) => {
  const { t } = useTranslation('common');
  const headingId = useOpaqueId('alert-heading');

  return (
    <Dialog open={open} onClose={onClose} role="alertdialog" aria-modal="true" aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {titleOverride ?? (isSuccess ? t('alert.success') : t('alert.title'))}
      </h2>
      <p className={styles.body}>{message}</p>
      {actionsOverride ?? <Button label={t('alert.close')} variant="outlined" onClick={onClose} fullWidth />}
    </Dialog>
  );
};

export default Alert;
