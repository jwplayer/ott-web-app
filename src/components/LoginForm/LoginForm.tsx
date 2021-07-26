import React from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { LoginFormData } from 'types/account';

import useToggle from '../../hooks/useToggle';
import { addQueryParam } from '../../utils/history';
import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import Link from '../Link/Link';
import IconButton from '../IconButton/IconButton';
import Visibility from '../../icons/Visibility';
import VisibilityOff from '../../icons/VisibilityOff';
import type { FormErrors } from '../../hooks/useForm';

import styles from './LoginForm.module.scss';
import FormFeedback from '../FormFeedback/FormFeedback';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<LoginFormData>;
  values: LoginFormData;
  submitting: boolean;
};

const LoginForm: React.FC<Props> = ({ onSubmit, onChange, values, errors, submitting }: Props) => {
  const [viewPassword, toggleViewPassword] = useToggle();
  const { t } = useTranslation('account');
  const history = useHistory();

  return (
    <form onSubmit={onSubmit} data-testid="login-form" noValidate>
      <h2 className={styles.title}>{t('login.sign_in')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      <TextField
        value={values.email}
        onChange={onChange}
        label={t('login.email')}
        placeholder={t('login.email')}
        error={!!errors.email || !!errors.form}
        helperText={errors.email}
        name="email"
        type="email"
      />
      <TextField
        value={values.password}
        onChange={onChange}
        label={t('login.password')}
        placeholder={t('login.password')}
        error={!!errors.password || !!errors.form}
        helperText={errors.password}
        name="password"
        type={viewPassword ? 'text' : 'password'}
        rightControl={
          <IconButton aria-label={viewPassword ? t('login.hide_password') : t('login.view_password')} onClick={() => toggleViewPassword()}>
            {viewPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        }
      />
      <Link className={styles.link} to={addQueryParam(history, 'u', 'forgot-password')}>
        {t('login.forgot_password')}
      </Link>
      <Button type="submit" label={t('login.sign_in')} variant="contained" color="primary" size="large" disabled={submitting} fullWidth />
    </form>
  );
};

export default LoginForm;
