import React from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { RegistrationFormData, Consent } from 'types/account';
import type { FormErrors } from 'types/form';

import useToggle from '../../hooks/useToggle';
import { addQueryParam } from '../../utils/history';
import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import Visibility from '../../icons/Visibility';
import VisibilityOff from '../../icons/VisibilityOff';
import PasswordStrength from '../PasswordStrength/PasswordStrength';
import Checkbox from '../Checkbox/Checkbox';
import Spinner from '../Spinner/Spinner';

import styles from './RegistrationForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onConsentChange: React.ChangeEventHandler<HTMLInputElement>;
  errors: FormErrors<RegistrationFormData>;
  values: RegistrationFormData;
  loading: boolean;
  consentValues: Record<string, boolean>;
  consentErrors: string[];
  submitting: boolean;
  publisherConsents?: Consent[];
};

const RegistrationForm: React.FC<Props> = ({
  onSubmit,
  onChange,
  values,
  errors,
  submitting,
  loading,
  publisherConsents,
  consentValues,
  onConsentChange,
  consentErrors,
}: Props) => {
  const [viewPassword, toggleViewPassword] = useToggle();

  const { t } = useTranslation('account');
  const history = useHistory();

  const loginButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'login'));
  };

  const formatConsentLabel = (label: string): string | JSX.Element => {
    // @todo sanitize consent label to prevent XSS
    const hasHrefOpenTag = /<a(.|\n)*?>/.test(label);
    const hasHrefCloseTag = /<\/a(.|\n)*?>/.test(label);

    if (hasHrefOpenTag && hasHrefCloseTag) {
      return <span dangerouslySetInnerHTML={{ __html: label }} />;
    }

    return label;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner size="small" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} data-testid="registration-form" noValidate>
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
        required
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
        required
      />
      <PasswordStrength password={values.password} />
      {publisherConsents?.map((consent, index) => (
        <Checkbox
          key={index}
          name={consent.name}
          value={consent.name}
          error={consentErrors?.includes(consent.name)}
          checked={consentValues[consent.name]}
          onChange={onConsentChange}
          label={formatConsentLabel(consent.label)}
        />
      ))}
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
