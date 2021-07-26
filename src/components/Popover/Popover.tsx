import React, { ReactNode, useRef } from 'react';
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
  const popoverRef = useRef<HTMLDivElement>(null);

  return isOpen ? (
    <DetectOutsideClick isActive={isOpen} callback={onClose} el={popoverRef}>
      <Slide open={isOpen} duration={300} onCloseAnimationEnd={() => onClose()} fromRight>
        <div ref={popoverRef} className={classNames(styles.popover)}>
          {children}
        </div>
      </Slide>
    </DetectOutsideClick>
  ) : null;
};

export default Popover;
