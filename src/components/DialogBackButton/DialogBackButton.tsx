import React from 'react';

import styles from './DialogBackButton.module.scss';

import IconButton from '#components/IconButton/IconButton';
import ArrowLeft from '#src/icons/ArrowLeft';

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
