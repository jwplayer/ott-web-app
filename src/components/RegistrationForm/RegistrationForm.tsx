import React from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { RegistrationFormData, Consent, ConsentsFormData } from 'types/account';
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
  onChangeConsent: React.ChangeEventHandler<HTMLInputElement>;
  consentsError: string[];
  errors: FormErrors<RegistrationFormData>;
  values: RegistrationFormData;
  loading: boolean;
  consentsFormData?: ConsentsFormData;
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
  consentsFormData,
  onChangeConsent,
  consentsError,
}: Props) => {
  const [viewPassword, toggleViewPassword] = useToggle();

  const { t } = useTranslation('account');
  const history = useHistory();

  const loginButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'login'));
  };

  const checkConsentLabel = (consentContent: string): string | JSX.Element => {
    const hasHrefOpenTag = /<a(.|\n)*?>/.test(consentContent);
    const hasHrefCloseTag = /<\/a(.|\n)*?>/.test(consentContent);

    if (hasHrefOpenTag && hasHrefCloseTag) {
      return <label dangerouslySetInnerHTML={{ __html: consentContent }} />;
    }
    return consentContent;
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
      <PasswordStrength password={values.password} />
      {consentsFormData &&
        publisherConsents?.map((consent, index) => (
          <Checkbox
            key={index}
            name={consent.name}
            value={consent.name}
            error={consentsError?.includes(consent.name)}
            onChange={onChangeConsent}
            label={checkConsentLabel(consent.label)}
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
