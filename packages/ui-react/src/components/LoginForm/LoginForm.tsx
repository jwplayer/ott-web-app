import React from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { FormErrors } from '@jwp/ott-common/types/form';
import type { LoginFormData } from '@jwp/ott-common/types/account';
import { testId } from '@jwp/ott-common/src/utils/common';
import useToggle from '@jwp/ott-hooks-react/src/useToggle';
import type { SocialLoginURLs } from '@jwp/ott-hooks-react/src/useSocialLoginUrls';
import { simultaneousLoginWarningKey } from '@jwp/ott-common/src/constants';
import Visibility from '@jwp/ott-theme/assets/icons/visibility.svg?react';
import VisibilityOff from '@jwp/ott-theme/assets/icons/visibility_off.svg?react';

import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import Link from '../Link/Link';
import IconButton from '../IconButton/IconButton';
import FormFeedback from '../FormFeedback/FormFeedback';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import SocialButtonsList from '../SocialButtonsList/SocialButtonsList';
import Icon from '../Icon/Icon';
import { modalURLFromLocation } from '../../utils/location';

import styles from './LoginForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<LoginFormData>;
  values: LoginFormData;
  validationError?: boolean;
  submitting: boolean;
  socialLoginURLs: SocialLoginURLs | null;
  siteName?: string;
  messageKey: string | null;
};

const LoginForm: React.FC<Props> = ({ onSubmit, onChange, socialLoginURLs, values, errors, validationError, submitting, siteName, messageKey }: Props) => {
  const [viewPassword, toggleViewPassword] = useToggle();
  const { t } = useTranslation('account');
  const location = useLocation();

  const getTranslatedErrorMessage = (messageId: string | null) => {
    switch (messageId) {
      case simultaneousLoginWarningKey:
        return t('login.simultaneous_logins');
    }
    return t('login.unexpected_error');
  };

  return (
    <form onSubmit={onSubmit} data-testid={testId('login-form')} noValidate>
      {messageKey && (
        <div className={styles.top}>
          <FormFeedback variant="warning">{getTranslatedErrorMessage(messageKey)}</FormFeedback>
        </div>
      )}
      {errors.form ? (
        <FormFeedback variant="error" visible={!validationError}>
          {errors.form}
        </FormFeedback>
      ) : null}

      <SocialButtonsList socialLoginURLs={socialLoginURLs} />
      <h2 className={styles.title}>{t('login.sign_in')}</h2>
      <TextField
        value={values.email}
        onChange={onChange}
        label={t('login.email')}
        placeholder={t('login.email')}
        error={!!errors.email}
        helperText={errors.email}
        name="email"
        type="email"
        required
        testId="login-email-input"
        autoComplete="email"
      />
      <TextField
        value={values.password}
        onChange={onChange}
        label={t('login.password')}
        placeholder={t('login.password')}
        error={!!errors.password}
        helperText={errors.password}
        name="password"
        type={viewPassword ? 'text' : 'password'}
        rightControl={
          <IconButton aria-label={t('login.view_password')} onClick={() => toggleViewPassword()} aria-pressed={viewPassword}>
            <Icon icon={viewPassword ? Visibility : VisibilityOff} />
          </IconButton>
        }
        required
        testId="login-password-input"
        autoComplete="current-password"
      />
      {submitting && <LoadingOverlay transparentBackground inline />}
      <Link className={styles.link} to={modalURLFromLocation(location, 'forgot-password')}>
        {t('login.forgot_password')}
      </Link>
      <Button type="submit" label={t('login.sign_in')} variant="contained" color="primary" size="large" disabled={submitting} fullWidth />
      <p className={styles.bottom}>
        {t('login.not_registered', { siteName })} <Link to={modalURLFromLocation(location, 'create-account')}>{t('login.sign_up')}</Link>
      </p>
    </form>
  );
};

export default LoginForm;
