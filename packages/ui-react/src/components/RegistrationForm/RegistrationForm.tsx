import React, { type ChangeEventHandler, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import type { FormErrors } from '@jwp/ott-common/types/form';
import type { CustomFormField, RegistrationFormData } from '@jwp/ott-common/types/account';
import { testId } from '@jwp/ott-common/src/utils/common';
import type { SocialLoginURLs } from '@jwp/ott-hooks-react/src/useSocialLoginUrls';
import env from '@jwp/ott-common/src/env';
import { useCookieConsent } from '@jwp/ott-ui-react/src/hooks/useCookieConsent';
import type { ReCAPTCHA } from 'react-google-recaptcha';

import TextField from '../form-fields/TextField/TextField';
import Button from '../Button/Button';
import CustomRegisterField from '../CustomRegisterField/CustomRegisterField';
import FormFeedback from '../FormFeedback/FormFeedback';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import Link from '../Link/Link';
import { modalURLFromLocation } from '../../utils/location';
import PasswordField from '../form-fields/PasswordField/PasswordField';
import RecaptchaField from '../RecaptchaField/RecaptchaField';

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
  socialLoginURLs: SocialLoginURLs | null;
  captchaSiteKey?: string;
  recaptchaRef?: React.RefObject<ReCAPTCHA>;
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
  captchaSiteKey,
  recaptchaRef,
}: Props) => {
  const { t, i18n } = useTranslation('account');
  const location = useLocation();
  const { isActive, consent: cookieConsent } = useCookieConsent();

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

  const requiredConsentsChecked = publisherConsents?.filter(({ type, required }) => type === 'checkbox' && required).every(({ name }) => !!consentValues[name]);
  const hasConsent = isActive ? cookieConsent === 'accepted' || requiredConsentsChecked : requiredConsentsChecked;
  const loadRecaptcha = !!captchaSiteKey && hasConsent;

  return (
    <form onSubmit={onSubmit} data-testid={testId('registration-form')} noValidate>
      <div ref={ref}>
        {errors.form ? (
          <FormFeedback variant="error" visible={!validationError}>
            {errors.form}
          </FormFeedback>
        ) : null}
      </div>
      <h2 className={styles.title}>{t('registration.sign_up')}</h2>
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
      <PasswordField
        value={values.password}
        onChange={onChange}
        onBlur={onBlur}
        label={t('registration.password')}
        placeholder={t('registration.password')}
        error={!!errors.password}
        name="password"
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
                helperText={consentError ? t('registration.field_required') : undefined}
                onChange={onConsentChange}
                lang={htmlLang}
              />
            );
          })}
        </div>
      )}
      {loadRecaptcha && <RecaptchaField siteKey={captchaSiteKey} ref={recaptchaRef} size={cookieConsent === 'accepted' ? 'invisible' : 'normal'} />}
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
