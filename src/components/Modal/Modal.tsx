import React, { ReactFragment, useEffect, useState, useCallback } from 'react';
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
  const [closing, setClosing] = useState<boolean>(false);

  const prepareClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.keyCode === 27 && prepareClose();

    document.body.style.overflowY = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    setClosing(false);
    return () => {
      document.body.style.overflowY = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [prepareClose]);

  return (
    <div className={classNames(styles.overlay, { [styles.closing]: closing })} onClick={prepareClose}>
      <div className={styles.backdrop} />
      <div className={classNames(styles.modalContainer, { [styles.closing]: closing })}>
        <div className={styles.modalBackground} />
        <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
          {children}
          <IconButton
            onClick={prepareClose}
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
