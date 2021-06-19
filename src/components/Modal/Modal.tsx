import React, { ReactFragment, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import IconButton from '../IconButton/IconButton';
import Close from '../../icons/Close';
// import Fade from '../Animation/Fade/Fade';

import styles from './Modal.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  closeButtonVisible?: boolean;
  children: ReactFragment;
};

type Status = 'opening' | 'open' | 'closing' | 'closed';

const Modal: React.FC<Props> = ({ open, onClose, closeButtonVisible = true, children }: Props) => {
  const { t } = useTranslation('common');
  const [status, setStatus] = useState<Status>('closed');

  const prepareClose = useCallback(() => {
    if (open) {
      setStatus('closing');
      setTimeout(() => setStatus('closed'), 150);
      document.body.style.overflowY = '';
      document.removeEventListener('keydown', (event: KeyboardEvent) => event.keyCode === 27 && prepareClose());
      onClose();
    }
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setStatus('opening'), 10); // wait for overlay to appear
      setTimeout(() => setStatus('open'), 250);

      document.body.style.overflowY = 'hidden';
      document.addEventListener('keydown', (event: KeyboardEvent) => event.keyCode === 27 && prepareClose());
    }
  }, [open, prepareClose]);

  return (
    <div className={classNames(styles.overlay, { [styles.hidden]: !open && status !== 'closing' })} onClick={prepareClose}>
      <div className={classNames(styles.backdrop, { [styles.open]: status === 'opening' || status === 'open' })} />
      <div className={classNames(styles.modalContainer)}>
        <div className={classNames(styles.modalBackground, { [styles.open]: status === 'opening' || status === 'open' })} />
        <div className={classNames(styles.modal, { [styles.open]: status === 'open' })} onClick={(event) => event.stopPropagation()}>
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
