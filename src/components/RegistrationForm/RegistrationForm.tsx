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
import FormFeedback from '../FormFeedback/FormFeedback';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import Link from '../Link/Link';

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
  canSubmit: boolean;
  publisherConsents?: Consent[];
};

const RegistrationForm: React.FC<Props> = ({
  onSubmit,
  onChange,
  values,
  errors,
  submitting,
  loading,
  canSubmit,
  publisherConsents,
  consentValues,
  onConsentChange,
  consentErrors,
}: Props) => {
  const [viewPassword, toggleViewPassword] = useToggle();

  const { t } = useTranslation('account');
  const history = useHistory();

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
      <div style={{ height: 400 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} data-testid="registration-form" noValidate>
      <h2 className={styles.title}>{t('registration.sign_up')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
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
          required={consent.required}
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
        disabled={submitting || !canSubmit}
        fullWidth
      />
      <p className={styles.bottom}>
        {t('registration.already_account')} <Link to={addQueryParam(history, 'u', 'login')}>{t('login.sign_in')}</Link>
      </p>
      {submitting && <LoadingOverlay transparentBackground inline />}
    </form>
  );
};

export default RegistrationForm;
