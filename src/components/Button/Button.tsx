import React from 'react';
import classNames from 'classnames';

import styles from './Button.module.scss';

type Props = {
  label: string;
  active: boolean;
  onClick: () => void;
};

const Button: React.FC<Props> = ({ label, active, onClick }: Props) => {
  return (
    <button
      className={classNames(styles.button, {
        [styles.active]: active,
      })}
      onClick={onClick}
    >
      <span className={styles.buttonLabel}>{label}</span>
    </button>
  );
};

export default Button;
