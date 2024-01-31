import React, { type ReactNode } from 'react';
import classNames from 'classnames';

import DetectOutsideClick from '../DetectOutsideClick/DetectOutsideClick';
import Slide from '../Animation/Slide/Slide';

import styles from './Popover.module.scss';

type Props = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

const Popover: React.FC<Props> = ({ children, isOpen, onClose }: Props) => {
  return (
    <Slide open={isOpen} duration={250} direction="right" style={{ position: 'relative' }}>
      <DetectOutsideClick callback={onClose}>
        <div className={classNames(styles.popover)}>{children}</div>
      </DetectOutsideClick>
    </Slide>
  );
};

export default Popover;
