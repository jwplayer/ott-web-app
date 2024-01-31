import React, { AriaAttributes } from 'react';
import classNames from 'classnames';

import Modal from '../Modal/Modal';
import Slide from '../Animation/Slide/Slide';
import ModalCloseButton from '../ModalCloseButton/ModalCloseButton';

import styles from './Dialog.module.scss';

type Props = Pick<AriaAttributes, 'aria-labelledby' | 'aria-label'> & {
  open: boolean;
  onClose: () => void;
  size?: 'small' | 'large';
  children: React.ReactNode;
  role: React.AriaRole;
  'aria-labelledby'?: string; // non-optional
};

const Dialog: React.FC<Props> = ({ open, onClose, size = 'small', children, role, ...rest }: Props) => {
  return (
    <Modal open={open} onClose={onClose} AnimationComponent={Slide} role={role} {...rest}>
      <div className={classNames(styles.dialog, styles[size])}>
        <ModalCloseButton onClick={onClose} />
        {children}
      </div>
    </Modal>
  );
};

export default Dialog;
