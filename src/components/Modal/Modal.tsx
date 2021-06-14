import React, { ReactFragment, useEffect } from 'react';

import IconButton from '../IconButton/IconButton';
import Close from '../../icons/Close';

import styles from './Modal.module.scss';

type Props = {
  onClose: () => void;
  children: ReactFragment;
};

const Modal: React.FC<Props> = ({ onClose, children }: Props) => {
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
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.backdrop} />
      <div className={styles.modalContainer}>
        <div className={styles.main} onClick={(event) => event.stopPropagation()}>
          <IconButton onClick={onClose} aria-label={'Close'} className={styles.close}>
            <Close />
          </IconButton>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
