import React from 'react';

import styles from './PasswordStrength.module.scss';

type Props = {
  strength: number;
};

const PasswordStrength: React.FC<Props> = ({ strength }: Props) => {
  return (
    <div className={styles.passwordStrength}>
      <div className={styles.passwordStrengthBar}>
        <div className={styles.passwordStrengthFill} data-strength={strength}></div>
      </div>
      <span>Use a minimum of 6 characters (case sensitive) with at least one number or special character and one capital character</span>
    </div>
  );
};

export default PasswordStrength;
