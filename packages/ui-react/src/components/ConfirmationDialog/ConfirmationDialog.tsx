import React from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from '../Dialog/Dialog';
import Button from '../Button/Button';

import styles from './ConfirmationDialog.module.scss';

type Props = {
  open: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
};

const ConfirmationDialog: React.FC<Props> = ({ open, title, body, onConfirm, onClose, busy }: Props) => {
  const { t } = useTranslation('common');

  return (
    <Dialog open={open} onClose={onClose} role="alertdialog">
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      <Button
        className={styles.confirmButton}
        label={t('confirmation_dialog.confirm')}
        variant={'contained'}
        color={busy ? 'default' : 'primary'}
        onClick={onConfirm}
        fullWidth
        disabled={busy}
        busy={busy}
      />
      <Button label={t('confirmation_dialog.close')} variant="outlined" onClick={onClose} fullWidth disabled={busy} />
    </Dialog>
  );
};

export default ConfirmationDialog;
