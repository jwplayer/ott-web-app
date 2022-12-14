import React from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

import styles from './LoginForm.module.scss';

import useToggle from '#src/hooks/useToggle';
import TextField from '#components/TextField/TextField';
import Button from '#components/Button/Button';
import Link from '#components/Link/Link';
import IconButton from '#components/IconButton/IconButton';
import Visibility from '#src/icons/Visibility';
import VisibilityOff from '#src/icons/VisibilityOff';
import FormFeedback from '#components/FormFeedback/FormFeedback';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import { testId } from '#src/utils/common';
import { addQueryParam } from '#src/utils/location';
import type { FormErrors } from '#types/form';
import type { LoginFormData } from '#types/account';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<LoginFormData>;
  values: LoginFormData;
  submitting: boolean;
  siteName?: string;
};

const LoginForm: React.FC<Props> = ({ onSubmit, onChange, values, errors, submitting, siteName }: Props) => {
  const [viewPassword, toggleViewPassword] = useToggle();
  const { t } = useTranslation('account');
  const location = useLocation();

  return (
    <form onSubmit={onSubmit} data-testid={testId('login-form')} noValidate>
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
        required
        testId="login-email-input"
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
        required
        testId="login-password-input"
      />
      {submitting && <LoadingOverlay transparentBackground inline />}
      <Link className={styles.link} to={addQueryParam(location, 'u', 'forgot-password')}>
        {t('login.forgot_password')}
      </Link>
      <Button type="submit" label={t('login.sign_in')} variant="contained" color="primary" size="large" disabled={submitting} fullWidth />
      <p className={styles.bottom}>
        {t('login.not_registered', { siteName })} <Link to={addQueryParam(location, 'u', 'create-account')}>{t('login.sign_up')}</Link>
      </p>
    </form>
  );
};

export default LoginForm;
