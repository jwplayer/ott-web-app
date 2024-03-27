import React, { useEffect, useState, type ChangeEventHandler } from 'react';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import type { RegistrationFormData } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { checkConsentsFromValues, extractConsentValues, formatConsentsFromValues } from '@jwp/ott-common/src/utils/collection';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';

import RegistrationForm from '../../../components/RegistrationForm/RegistrationForm';
import { useAriaAnnouncer } from '../../AnnouncementProvider/AnnoucementProvider';

const Registration = () => {
  const accountController = getModule(AccountController);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  const announce = useAriaAnnouncer();
  const [consentValues, setConsentValues] = useState<Record<string, string | boolean>>({});
  const [consentErrors, setConsentErrors] = useState<string[]>([]);

  const { publisherConsents, publisherConsentsLoading, loading } = useAccountStore(({ publisherConsents, publisherConsentsLoading, loading }) => ({
    publisherConsents,
    publisherConsentsLoading,
    loading,
  }));

  const handleChangeConsent: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ currentTarget }) => {
    if (!currentTarget) return;

    const { name, type } = currentTarget;
    const value = type === 'checkbox' ? (currentTarget as HTMLInputElement).checked : currentTarget.value;

    setConsentValues((current) => ({
      ...current,
      [name]: value,
    }));

    // Clear the errors for any checkbox that's toggled
    setConsentErrors((errors) => errors.filter((e) => e !== name));
  };

  useEffect(() => {
    if (!publisherConsents) {
      accountController.getPublisherConsents();

      return;
    }

    setConsentValues(extractConsentValues(publisherConsents));
  }, [accountController, publisherConsents]);

  const { handleSubmit, handleChange, handleBlur, values, errors, validationSchemaError, submitting } = useForm<RegistrationFormData>({
    initialValues: { email: '', password: '' },
    validationSchema: object().shape({
      email: string()
        .email(t('registration.field_is_not_valid_email'))
        .required(t('registration.field_required', { field: t('registration.email') })),
      password: string()
        .matches(/^(?=.*[a-z])(?=.*[0-9]).{8,}$/, t('registration.invalid_password', { field: t('registration.password') }))
        .required(t('registration.field_required', { field: t('registration.password') })),
    }),
    validateOnBlur: true,
    onSubmit: async ({ email, password }) => {
      const { consentsErrors } = checkConsentsFromValues(publisherConsents || [], consentValues);

      if (consentsErrors.length) {
        setConsentErrors(consentsErrors);
        throw new Error(t('registration.consents_error'));
      }

      await accountController.register(email, password, window.location.href, formatConsentsFromValues(publisherConsents, consentValues));
    },
    onSubmitSuccess: () => {
      announce(t('registration.success'), 'success');
      navigate(modalURLFromLocation(location, 'personal-details'));
    },
  });

  return (
    <RegistrationForm
      onSubmit={handleSubmit}
      onChange={handleChange}
      onConsentChange={handleChangeConsent}
      onBlur={handleBlur}
      values={values}
      errors={errors}
      consentErrors={consentErrors}
      validationError={validationSchemaError}
      submitting={submitting}
      consentValues={consentValues}
      publisherConsents={publisherConsents}
      loading={loading || publisherConsentsLoading}
    />
  );
};

export default Registration;
