import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Fade from '../Animation/Fade/Fade';
import IconButton from '../IconButton/IconButton';
import Close from '../../icons/Close';

import styles from './Modal.module.scss';

type Props = {
  className?: string;
  children?: React.ReactNode;
  open: boolean;
  onClose?: () => void;
  closeButtonVisible?: boolean;
};

const Modal: React.FC<Props> = ({ className, open, onClose, children, closeButtonVisible }: Props) => {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(open);
  const lastFocus = useRef<HTMLElement>() as React.MutableRefObject<HTMLElement>;
  const modalRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;

  const keyDownEventHandler = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && onClose) {
      onClose();
    }
  };

  // delay the transition state so the CSS transition kicks in after toggling the `open` prop
  useEffect(() => {
    const activeElement = document.activeElement as HTMLElement;
    const appView = document.querySelector('#root') as HTMLDivElement;

    if (open) {
      // store last focussed element
      if (activeElement) {
        lastFocus.current = activeElement;
      }

      // reset the visible state
      setVisible(true);

      // make sure main content is hidden for screen readers and inert
      if (appView) {
        appView.setAttribute('aria-hidden', 'true');
        appView.inert = true;
      }

      // prevent scrolling under the modal
      document.body.style.overflowY = 'hidden';

      // focus the first element in the modal
      if (modalRef.current) {
        const interactiveElement = modalRef.current.querySelectorAll('a, button, [tabindex="0"]')[0] as HTMLElement | null;

        if (interactiveElement) interactiveElement.focus();
      }
    } else {
      if (appView) {
        appView.removeAttribute('aria-hidden');
        appView.inert = false;
      }

      document.body.style.overflowY = '';

      // restore last focussed element
      if (lastFocus.current) {
        lastFocus.current.focus();
      }
    }
  }, [open]);

  if (!open && !visible) return null;

  return ReactDOM.createPortal(
    <Fade open={open} duration={300} onCloseAnimationEnd={() => setVisible(false)}>
      <div className={styles.modal} onKeyDown={keyDownEventHandler} ref={modalRef}>
        <div className={styles.backdrop} onClick={onClose} data-testid="backdrop" />
        <div className={classNames(styles.container, className)}>
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
    </Fade>,
    document.querySelector('body') as HTMLElement,
  );
};

export default Modal;
