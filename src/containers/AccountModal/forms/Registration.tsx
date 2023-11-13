import React, { ChangeEventHandler, useEffect, useMemo, useState } from 'react';
import { object, string, SchemaOf } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useQuery, useQueryClient } from 'react-query';

import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import RegistrationForm from '#components/RegistrationForm/RegistrationForm';
import { extractConsentValues, checkConsentsFromValues } from '#src/utils/collection';
import { addQueryParam } from '#src/utils/location';
import type { RegistrationFormData } from '#types/account';
import AccountController from '#src/stores/AccountController';
import { useConfigStore } from '#src/stores/ConfigStore';
import { getModule } from '#src/modules/container';

const Registration = () => {
  const accountController = getModule(AccountController);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  const [consentValues, setConsentValues] = useState<Record<string, string | boolean>>({});
  const [consentErrors, setConsentErrors] = useState<string[]>([]);

  const appConfigId = useConfigStore(({ config }) => config.id);
  const { data, isLoading: publisherConsentsLoading } = useQuery(['consents', appConfigId], accountController.getPublisherConsents);

  const publisherConsents = useMemo(() => data?.consents || [], [data]);

  const queryClient = useQueryClient();

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
    if (publisherConsents) {
      setConsentValues(extractConsentValues(publisherConsents));
    }
  }, [publisherConsents]);

  const registrationSubmitHandler: UseFormOnSubmitHandler<RegistrationFormData> = async ({ email, password }, { setErrors, setSubmitting, setValue }) => {
    try {
      const { consentsErrors, customerConsents } = checkConsentsFromValues(publisherConsents, consentValues);

      if (consentsErrors.length) {
        setConsentErrors(consentsErrors);
        setSubmitting(false);
        return;
      }

      await accountController.register(email, password, customerConsents);
      await queryClient.invalidateQueries('listProfiles');

      navigate(addQueryParam(location, 'u', 'personal-details'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('customer already exists') || errorMessage.includes('account already exists')) {
          setErrors({ form: t('registration.user_exists') });
        } else if (errorMessage.includes('invalid param password')) {
          setErrors({ password: t('registration.invalid_password') });
        } else {
          // in case the endpoint fails
          setErrors({ password: t('registration.failed_to_create') });
        }
        setValue('password', '');
      }
    }

    setSubmitting(false);
  };

  const validationSchema: SchemaOf<RegistrationFormData> = object().shape({
    email: string().email(t('registration.field_is_not_valid_email')).required(t('registration.field_required')),
    password: string()
      .matches(/^(?=.*[a-z])(?=.*[0-9]).{8,}$/, t('registration.invalid_password'))
      .required(t('registration.field_required')),
  });

  const initialRegistrationValues: RegistrationFormData = { email: '', password: '' };
  const { handleSubmit, handleChange, handleBlur, values, errors, submitting } = useForm(
    initialRegistrationValues,
    registrationSubmitHandler,
    validationSchema,
    true,
  );

  return (
    <RegistrationForm
      onSubmit={handleSubmit}
      onChange={handleChange}
      onBlur={handleBlur}
      values={values}
      errors={errors}
      consentErrors={consentErrors}
      submitting={submitting}
      consentValues={consentValues}
      publisherConsents={publisherConsents}
      loading={publisherConsentsLoading}
      onConsentChange={handleChangeConsent}
      canSubmit={!!values.email && !!values.password}
    />
  );
};

export default Registration;
