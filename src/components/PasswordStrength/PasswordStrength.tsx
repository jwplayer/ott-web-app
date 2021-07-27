import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PasswordStrength.module.scss';

type Props = {
  password: string;
};

const PasswordStrength: React.FC<Props> = ({ password }: Props) => {
  const { t } = useTranslation('account');
  const passwordStrength = (password: string) => {
    let strength = 0;

    if (password.match(/[a-z]+/)) {
      strength += 1;
    }
    if (password.match(/[A-Z]+/)) {
      strength += 1;
    }
    if (password.match(/[0-9|!@#$%^&*()_+-=]+/)) {
      strength += 1;
    }
    if (password.length >= 6) {
      strength += 1;
    }

    return strength;
  };
  return (
    <div className={styles.passwordStrength}>
      <div className={styles.passwordStrengthBar}>
        <div className={styles.passwordStrengthFill} data-strength={passwordStrength(password)}></div>
      </div>
      <span>{t('registration.password_strength')}</span>
    </div>
  );
};

export default PasswordStrength;
