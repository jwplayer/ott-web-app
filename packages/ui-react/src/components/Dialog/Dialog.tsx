import React from 'react';
import classNames from 'classnames';

import Modal from '../Modal/Modal';
import Slide from '../Animation/Slide/Slide';
import ModalCloseButton from '../ModalCloseButton/ModalCloseButton';

import styles from './Dialog.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  size?: 'small' | 'large';
  children: React.ReactNode;
};

const Dialog: React.FC<Props> = ({ open, onClose, size = 'small', children }: Props) => {
  return (
    <Modal open={open} onClose={onClose} AnimationComponent={Slide}>
      <div className={classNames(styles.dialog, styles[size])}>
        <ModalCloseButton onClick={onClose} />
        {children}
      </div>
    </Modal>
  );
};

export default Dialog;
