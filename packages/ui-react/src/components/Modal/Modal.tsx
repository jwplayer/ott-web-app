import React, { type HTMLAttributes, type KeyboardEventHandler, type ReactEventHandler, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import classNames from 'classnames';

import Grow from '../Animation/Grow/Grow';
import { useModal } from '../../hooks/useModal';

import styles from './Modal.module.scss';

export type AnimationProps = {
  open?: boolean;
  duration?: number;
  delay?: number;
  children: React.ReactNode;
  className?: string;
  onCloseAnimationEnd?: () => void;
};

type Props = {
  children?: React.ReactNode;
  className?: string;
  centered?: boolean;
  AnimationComponent?: React.ElementType<AnimationProps>;
  open: boolean;
  onClose?: () => void;
  animationContainerClassName?: string;
  role?: HTMLAttributes<HTMLElement>['role'];
} & React.AriaAttributes;

const Modal: React.FC<Props> = ({
  open,
  onClose,
  children,
  className,
  centered,
  role,
  AnimationComponent = Grow,
  animationContainerClassName,
  ...ariaAttributes
}: Props) => {
  const modalRef = useRef<HTMLDialogElement>() as React.MutableRefObject<HTMLDialogElement>;
  const mouseEventTargetsPairRef = useRef<Record<'downTarget' | 'upTarget', HTMLElement | null>>({ downTarget: null, upTarget: null });

  const { handleOpen, handleClose } = useModal();

  const closeModalEvent = useEventCallback(() => {
    const onAnimationEndHandler = () => {
      // modalRef.current?.close();
      modalRef.current?.classList.remove(styles.close);
      modalRef.current?.removeEventListener('animationend', onAnimationEndHandler);
    };

    if (modalRef.current?.open) {
      modalRef.current.addEventListener('animationend', onAnimationEndHandler);
      modalRef.current.classList.add(styles.close);
    }
  });

  const openModalEvent = useEventCallback(() => {
    handleOpen();
    modalRef.current?.showModal();
    modalRef.current?.classList.remove(styles.close);
  });

  const keyDownHandler: KeyboardEventHandler<HTMLDialogElement> = (event) => {
    if (event.key === 'Escape' && modalRef.current.contains(event.target as HTMLElement)) {
      event.preventDefault();
      onClose?.();
    }
  };

  const closeHandler: ReactEventHandler<HTMLDialogElement> = (event) => {
    if (modalRef.current.contains(event.target as HTMLElement)) {
      onClose?.();
      handleClose();
    }
  };

  const closeAnimationEndHandler = () => {
    modalRef.current?.close();
  };

  useEffect(() => {
    if (open) {
      openModalEvent();
    } else {
      closeModalEvent();
    }
  }, [openModalEvent, closeModalEvent, open]);

  const clickHandler: ReactEventHandler<HTMLDialogElement> = (event) => {
    const {
      current: { downTarget, upTarget },
    } = mouseEventTargetsPairRef;

    // modal should only close if both mousedown and mouseup are done on the overlay
    if (downTarget !== upTarget) {
      return;
    }

    // Backdrop click (the dialog itself) will close the modal
    if (event.target === modalRef.current) {
      onClose?.();
      handleClose();
    }
  };

  return ReactDOM.createPortal(
    <dialog
      className={classNames(className, { [styles.centered]: centered })}
      onKeyDown={keyDownHandler}
      onClose={closeHandler}
      onClick={clickHandler}
      onMouseDown={(e) => {
        mouseEventTargetsPairRef.current.downTarget = e.target as HTMLElement;
      }}
      onMouseUp={(e) => {
        mouseEventTargetsPairRef.current.upTarget = e.target as HTMLElement;
      }}
      ref={modalRef}
      role={role}
      {...ariaAttributes}
    >
      <AnimationComponent open={open} duration={300} className={animationContainerClassName} onCloseAnimationEnd={closeAnimationEndHandler}>
        {children}
      </AnimationComponent>
    </dialog>,
    document.querySelector('body') as HTMLElement,
  );
};

export default Modal;
