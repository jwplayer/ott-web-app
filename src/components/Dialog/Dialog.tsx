import React from 'react';

import Modal from '../Modal/Modal';
import Slide from '../Animation/Slide/Slide';
import ModalCloseButton from '../ModalCloseButton/ModalCloseButton';

import styles from './Dialog.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Dialog: React.FC<Props> = ({ open, onClose, children }: Props) => {
  return (
    <Modal open={open} onClose={onClose} AnimationComponent={Slide}>
      <div className={styles.dialog}>
        <ModalCloseButton onClick={onClose} />
        {children}
      </div>
    </Modal>
  );
};

export default Dialog;
