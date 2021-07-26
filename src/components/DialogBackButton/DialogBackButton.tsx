import React from 'react';

import IconButton from '../IconButton/IconButton';
import ArrowLeft from '../../icons/ArrowLeft';

import styles from './DialogBackButton.module.scss';

type Props = {
  onClick?: () => void;
};

const DialogBackButton: React.FC<Props> = ({ onClick }: Props) => {
  return (
    <IconButton onClick={onClick} className={styles.dialogBackButton} aria-label="Go back">
      <ArrowLeft />
    </IconButton>
  );
};

export default DialogBackButton;
