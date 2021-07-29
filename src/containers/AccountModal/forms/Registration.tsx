import React, { useEffect, useState } from 'react';
import { object, string, SchemaOf } from 'yup';
import type { RegistrationFormData, ConsentsFormData } from 'types/account';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { useQuery } from 'react-query';

import { getPublisherConsents } from '../../../services/account.service';
import RegistrationForm from '../../../components/RegistrationForm/RegistrationForm';
import useForm, { UseFormOnSubmitHandler } from '../../../hooks/useForm';
import { addQueryParam } from '../../../utils/history';
import { ConfigStore } from '../../../stores/ConfigStore';
import { extractConsentValues, checkConsentsFromValues } from '../../../utils/collection';
import { register, updateConsents } from '../../../stores/AccountStore';

const Registration = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const { cleengId, cleengSandbox: sandbox } = ConfigStore.useState((s) => s.config);
  const [consentsFormData, updateConsentsFormData] = useState<ConsentsFormData>({});
  const [consentsError, setConsentsError] = useState<string[]>([]);

  const publisherId = cleengId || '';
  const enabled = !!publisherId;
  const getConsents = () => getPublisherConsents({ publisherId }, sandbox);
  const { data: publisherConsents, isLoading: publisherConsentsLoading } = useQuery(['consents'], getConsents, { enabled });

  const handleChangeConsent = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateConsentsFormData((current) => ({ ...current, [event.target.name]: event.target.checked }));
  };

  useEffect(() => {
    updateConsentsFormData(extractConsentValues(publisherConsents?.responseData.consents));
  }, [publisherConsents?.responseData.consents]);

  const registrationSubmitHandler: UseFormOnSubmitHandler<RegistrationFormData> = async (
    { email, password },
    { setErrors, setSubmitting, setValue },
  ) => {
    try {
      const { consentsErrors, customerConsents } = checkConsentsFromValues(publisherConsents?.responseData.consents, consentsFormData);

      if (consentsErrors.length) {
        setConsentsError(consentsErrors);
        throw new Error('consent required');
      }

      await register(email, password);
      await updateConsents(customerConsents);

      history.push(addQueryParam(history, 'u', 'personal-details'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('customer already exists.')) {
          setErrors({ form: t('registration.user_exists') });
        } else if (errorMessage.includes('invalid param password')) {
          setErrors({ form: t('registration.invalid_password') });
        } else if (errorMessage.includes('consent required')) {
          setErrors({ form: t('registration.field_required') });
        }
        setValue('password', '');
      }
    }

    setSubmitting(false);
  };

  const validationSchema: SchemaOf<RegistrationFormData> = object().shape({
    email: string().email(t('registration.field_is_not_valid_email')).required(t('registration.field_required')),
    password: string().required(t('registration.field_required')),
  });

  const initialRegistrationValues: RegistrationFormData = { email: '', password: '' };
  const { handleSubmit, handleChange, values, errors, submitting } = useForm(initialRegistrationValues, registrationSubmitHandler, validationSchema);

  return (
    <RegistrationForm
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      consentsError={consentsError}
      submitting={submitting}
      consentsFormData={consentsFormData}
      publisherConsents={publisherConsents?.responseData.consents}
      loading={publisherConsentsLoading}
      onChangeConsent={handleChangeConsent}
    />
  );
};

export default Registration;
