import React, { useEffect, useMemo, useState } from 'react';
import { object, string, SchemaOf } from 'yup';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { useQuery } from 'react-query';

import RegistrationForm from '../../../components/RegistrationForm/RegistrationForm';
import useForm, { UseFormOnSubmitHandler } from '../../../hooks/useForm';
import { addQueryParam } from '../../../utils/history';
import { extractConsentValues, checkConsentsFromValues } from '../../../utils/collection';

import type { RegistrationFormData } from '#types/account';
import { getPublisherConsents, register, updateConsents } from '#src/stores/AccountController';

const Registration = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const [consentValues, setConsentValues] = useState<Record<string, boolean>>({});
  const [consentErrors, setConsentErrors] = useState<string[]>([]);

  const { data, isLoading: publisherConsentsLoading } = useQuery(['consents'], getPublisherConsents);
  const publisherConsents = useMemo(() => data?.responseData?.consents || [], [data]);

  const handleChangeConsent = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConsentValues((current) => ({ ...current, [event.target.name]: event.target.checked }));

    // Clear the errors for any checkbox that's toggled
    setConsentErrors((errors) => errors.filter((e) => e !== event.target.name));
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

      await register(email, password);

      await updateConsents(customerConsents).catch(() => {
        // error caught while updating the consents, but continue the registration flow
      });

      history.push(addQueryParam(history, 'u', 'personal-details'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('customer already exists.')) {
          setErrors({ form: t('registration.user_exists') });
        } else if (errorMessage.includes('invalid param password')) {
          setErrors({ password: t('registration.invalid_password') });
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
