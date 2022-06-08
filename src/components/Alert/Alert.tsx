import React from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from '../Dialog/Dialog';
import Button from '../Button/Button';

import styles from './Alert.module.scss';

type Props = {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

const Alert: React.FC<Props> = ({ open, title, body, onClose }: Props) => {
  const { t } = useTranslation('common');

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      <Button label={t('alert.close')} variant="outlined" onClick={onClose} fullWidth />
    </Dialog>
  );
};

export default Alert;
