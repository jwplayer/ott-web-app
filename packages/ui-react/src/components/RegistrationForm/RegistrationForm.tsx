import React, { type ChangeEventHandler, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import type { FormErrors } from '@jwp/ott-common/types/form';
import type { CustomFormField, RegistrationFormData } from '@jwp/ott-common/types/account';
import { testId } from '@jwp/ott-common/src/utils/common';
import useToggle from '@jwp/ott-hooks-react/src/useToggle';
import Visibility from '@jwp/ott-theme/assets/icons/visibility.svg?react';
import VisibilityOff from '@jwp/ott-theme/assets/icons/visibility_off.svg?react';
import env from '@jwp/ott-common/src/env';

import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import PasswordStrength from '../PasswordStrength/PasswordStrength';
import CustomRegisterField from '../CustomRegisterField/CustomRegisterField';
import FormFeedback from '../FormFeedback/FormFeedback';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import Link from '../Link/Link';
import Icon from '../Icon/Icon';
import { modalURLFromLocation } from '../../utils/location';

import styles from './RegistrationForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onConsentChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  errors: FormErrors<RegistrationFormData>;
  values: RegistrationFormData;
  loading: boolean;
  consentValues: Record<string, string | boolean>;
  consentErrors: string[];
  submitting: boolean;
  validationError?: boolean;
  publisherConsents: CustomFormField[] | null;
};

const RegistrationForm: React.FC<Props> = ({
  onSubmit,
  onChange,
  onBlur,
  values,
  errors,
  submitting,
  validationError,
  loading,
  publisherConsents,
  consentValues,
  onConsentChange,
  consentErrors,
}: Props) => {
  const [viewPassword, toggleViewPassword] = useToggle();

  const { t, i18n } = useTranslation('account');
  const location = useLocation();

  const ref = useRef<HTMLDivElement>(null);
  const htmlLang = i18n.language !== env.APP_DEFAULT_LANGUAGE ? env.APP_DEFAULT_LANGUAGE : undefined;

  const formatConsentLabel = (label: string): string | JSX.Element => {
    const sanitizedLabel = DOMPurify.sanitize(label);
    const hasHrefOpenTag = /<a(.|\n)*?>/.test(sanitizedLabel);
    const hasHrefCloseTag = /<\/a(.|\n)*?>/.test(sanitizedLabel);

    if (hasHrefOpenTag && hasHrefCloseTag) {
      return <span dangerouslySetInnerHTML={{ __html: label }} />;
    }

    return label;
  };

  useEffect(() => {
    if (errors.form) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [errors.form]);

  return (
    <form onSubmit={onSubmit} data-testid={testId('registration-form')} noValidate>
      <h2 className={styles.title}>{t('registration.sign_up')}</h2>
      <div ref={ref}>
        {errors.form ? (
          <FormFeedback variant="error" visible={!validationError}>
            {errors.form}
          </FormFeedback>
        ) : null}
      </div>
      <TextField
        value={values.email}
        onChange={onChange}
        onBlur={onBlur}
        label={t('registration.email')}
        placeholder={t('registration.email')}
        error={!!errors.email}
        helperText={errors.email}
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <TextField
        value={values.password}
        onChange={onChange}
        onBlur={onBlur}
        label={t('registration.password')}
        placeholder={t('registration.password')}
        error={!!errors.password}
        helperText={
          <React.Fragment>
            <PasswordStrength password={values.password} />
            {t('registration.password_helper_text')}
          </React.Fragment>
        }
        name="password"
        type={viewPassword ? 'text' : 'password'}
        rightControl={
          <IconButton aria-label={t('registration.view_password')} onClick={() => toggleViewPassword()} aria-pressed={viewPassword}>
            <Icon icon={viewPassword ? Visibility : VisibilityOff} />
          </IconButton>
        }
        autoComplete="new-password"
        required
      />
      {publisherConsents && (
        <div className={styles.customFields} data-testid="custom-reg-fields">
          {publisherConsents.map((consent) => {
            const consentError = consentErrors.find((error) => error === consent.name);

            return (
              <CustomRegisterField
                key={consent.name}
                type={consent.type}
                name={consent.name}
                options={consent.options}
                label={formatConsentLabel(consent.label)}
                placeholder={consent.placeholder}
                value={consentValues[consent.name] || ''}
                required={consent.required}
                error={!!consentError}
                helperText={consentErrors?.includes(consent.name) ? t('registration.consent_required', { field: consent.name }) : undefined}
                onChange={onConsentChange}
                lang={htmlLang}
              />
            );
          })}
        </div>
      )}
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
      <p className={styles.bottom}>
        {t('registration.already_account')} <Link to={modalURLFromLocation(location, 'login')}>{t('login.sign_in')}</Link>
      </p>
      {(loading || submitting) && <LoadingOverlay transparentBackground inline />}
    </form>
  );
};

export default RegistrationForm;
