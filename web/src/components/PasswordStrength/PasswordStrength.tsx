import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PasswordStrength.module.scss';

type Props = {
  password: string;
};

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[0-9]).{8,}$/;

const PasswordStrength: React.FC<Props> = ({ password }: Props) => {
  const { t } = useTranslation('account');

  const passwordStrength = (password: string) => {
    let strength = 0;

    if (!password.match(PASSWORD_REGEX)) return strength;

    if (password.match(/[A-Z]+/)) {
      strength += 1;
    }

    if (password.match(/(\d.*\d)/)) {
      strength += 1;
    }

    if (password.match(/[!,@#$%^&*?_~]/)) {
      strength += 1;
    }

    if (password.match(/([!,@#$%^&*?_~].*[!,@#$%^&*?_~])/)) {
      strength += 1;
    }

    return strength;
  };
  const strength = passwordStrength(password);
  const labels = [
    t('registration.password_strength.invalid'),
    t('registration.password_strength.weak'),
    t('registration.password_strength.fair'),
    t('registration.password_strength.strong'),
    t('registration.password_strength.very_strong'),
  ];

  if (!strength) return null;

  return (
    <div className={styles.passwordStrength} data-strength={strength}>
      <div className={styles.passwordStrengthBar}>
        <div className={styles.passwordStrengthFill} />
      </div>{' '}
      <span className={styles.label}>{labels[strength]}</span>
    </div>
  );
};

export default PasswordStrength;
