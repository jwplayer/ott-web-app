import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Alert.module.scss';

import Dialog from '#components/Dialog/Dialog';
import Button from '#components/Button/Button';

type Props = {
  open: boolean;
  message: string | null;
  onClose: () => void;
};

const Alert: React.FC<Props> = ({ open, message, onClose }: Props) => {
  const { t } = useTranslation('common');

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className={styles.title}>{t('alert.title')}</h2>
      <p className={styles.body}>{message}</p>
      <Button label={t('alert.close')} variant="outlined" onClick={onClose} fullWidth />
    </Dialog>
  );
};

export default Alert;
