import React from 'react';
import { useHistory } from 'react-router';
import { useTranslation, Trans } from 'react-i18next';
import type { RegistrationFormData } from 'types/account';

import useToggle from '../../hooks/useToggle';
import { addQueryParam } from '../../utils/history';
import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import Visibility from '../../icons/Visibility';
import VisibilityOff from '../../icons/VisibilityOff';
import type { FormErrors } from '../../hooks/useForm';
import PasswordStrength from '../PasswordStrength/PasswordStrength';
import Checkbox from '../Checkbox/Checkbox';
import { termsConditionsUrl } from '../../config';

import styles from './RegistrationForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<RegistrationFormData>;
  values: RegistrationFormData;
  submitting: boolean;
};

const RegistrationForm: React.FC<Props> = ({ onSubmit, onChange, values, errors, submitting }: Props) => {
  const [viewPassword, toggleViewPassword] = useToggle();

  const { t } = useTranslation('account');
  const history = useHistory();

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

  const loginButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'login'));
  };

  return (
    <form onSubmit={onSubmit} data-testid="registration-form">
      <h2 className={styles.title}>{t('registration.sign_up')}</h2>
      {errors.form ? <div className={styles.error}>{errors.form}</div> : null}
      <TextField
        value={values.email}
        onChange={onChange}
        label={t('registration.email')}
        placeholder={t('registration.email')}
        error={!!errors.email || !!errors.form}
        helperText={errors.email}
        name="email"
        type="email"
      />
      <TextField
        value={values.password}
        onChange={onChange}
        label={t('registration.password')}
        placeholder={t('registration.password')}
        error={!!errors.password || !!errors.form}
        helperText={errors.password}
        name="password"
        type={viewPassword ? 'text' : 'password'}
        rightControl={
          <IconButton
            aria-label={viewPassword ? t('registration.hide_password') : t('registration.view_password')}
            onClick={() => toggleViewPassword()}
          >
            {viewPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        }
      />
      <PasswordStrength strength={passwordStrength(values.password)} />
      <Checkbox
        onChange={onChange}
        name="terms-conditions"
        value={values.termsConditions}
        label={<Trans t={t} i18nKey="registration.terms_conditions" values={{ link: termsConditionsUrl }} components={{ a: <a /> }} />}
      />
      <Checkbox onChange={onChange} value={values.emailUpdates} name="email-updates" label={t('registration.email_updates')} />
      <Button
        className={styles.continue}
        type="submit"
        label={t('registration.continue')}
        variant="contained"
        color="primary"
        size="large"
        disabled={submitting}
        fullWidth
      />
      <div className={styles.bottom}>
        <span className={styles.alreadyAccount}>{t('registration.already_account')}</span>
        <button className={styles.login} onClick={loginButtonClickHandler}>
          {t('login.sign_in')}
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
