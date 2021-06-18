import React, { ReactFragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import IconButton from '../IconButton/IconButton';
import Close from '../../icons/Close';

import styles from './Modal.module.scss';

type Props = {
  onClose: () => void;
  closeButtonVisible?: boolean;
  children: ReactFragment;
};

const Modal: React.FC<Props> = ({ onClose, closeButtonVisible = true, children }: Props) => {
  const { t } = useTranslation('common');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.keyCode === 27 && onClose();

    document.body.style.overflowY = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflowY = 'auto';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.backdrop} />
      <div className={styles.modalContainer}>
        <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
          {children}
          <IconButton
            onClick={onClose}
            aria-label={t('close_modal')}
            className={classNames(styles.close, { [styles.hidden]: !closeButtonVisible })}
          >
            <Close />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Modal;
