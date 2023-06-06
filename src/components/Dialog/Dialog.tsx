import React from 'react';
import classNames from 'classnames';

import styles from './Dialog.module.scss';

import Modal from '#components/Modal/Modal';
import Slide from '#components/Animation/Slide/Slide';
import ModalCloseButton from '#components/ModalCloseButton/ModalCloseButton';

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
