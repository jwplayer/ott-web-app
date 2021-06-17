import React, { ReactFragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import IconButton from '../IconButton/IconButton';
import Close from '../../icons/Close';

import styles from './Modal.module.scss';

type Props = {
  onClose: () => void;
  children: ReactFragment;
};

const Modal: React.FC<Props> = ({ onClose, children }: Props) => {
  const { t } = useTranslation('common');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.keyCode === 27 && onClose();

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = 'scroll';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.backdrop} />
      <div className={styles.modalContainer}>
        <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
          <IconButton onClick={onClose} aria-label={t('close_modal')} className={styles.close}>
            <Close />
          </IconButton>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
