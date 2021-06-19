import React, { ReactFragment, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import IconButton from '../IconButton/IconButton';
import Close from '../../icons/Close';
import Fade from '../Animation/Fade/Fade';
import Grow from '../Animation/Grow/Grow';

import styles from './Modal.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  closeButtonVisible?: boolean;
  children: ReactFragment;
};

const Modal: React.FC<Props> = ({ open, onClose, closeButtonVisible = true, children }: Props) => {
  const { t } = useTranslation('common');
  const [doRender, setDoRender] = useState<boolean>(false);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => event.keyCode === 27 && onClose();
    if (open) {
      document.body.style.overflowY = 'hidden';
      document.addEventListener('keydown', listener);
    } else {
      document.body.style.overflowY = '';
      document.removeEventListener('keydown', listener);
    }
  }, [open, onClose]);

  return (
    <Fade open={open} duration={300}>
      <div className={classNames(styles.overlay)} onClick={onClose}>
        <div className={classNames(styles.backdrop)} />
        <div className={classNames(styles.modalContainer)}>
          <Grow
            open={open}
            delay={100}
            duration={200}
            onOpenAnimationDone={() => setDoRender(true)}
            onCloseAnimationEnd={() => setDoRender(false)}
          >
            <div className={classNames(styles.modalBackground)} />
            <div className={classNames(styles.modal)} onClick={(event) => event.stopPropagation()}>
              {doRender && children}
              <IconButton
                onClick={onClose}
                aria-label={t('close_modal')}
                className={classNames(styles.close, { [styles.hidden]: !closeButtonVisible })}
              >
                <Close />
              </IconButton>
            </div>
          </Grow>
        </div>
      </div>
    </Fade>
  );
};

export default Modal;
