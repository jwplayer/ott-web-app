import React from 'react';
import { object, string, SchemaOf, boolean } from 'yup';
import type { RegistrationFormData } from 'types/account';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import RegistrationForm from '../../../components/RegistrationForm/RegistrationForm';
import useForm, { UseFormOnSubmitHandler } from '../../../hooks/useForm';
import { addQueryParam } from '../../../utils/history';

//todo add registration logic

const temp = (t: unknown) => {
  t;
};

const Registration = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const loginSubmitHandler: UseFormOnSubmitHandler<RegistrationFormData> = async (formData, { setErrors, setSubmitting, setValue }) => {
    try {
      await temp(formData);

      history.push(addQueryParam(history, 'u', 'personal_details'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('invalid param email')) {
          setErrors({ email: t('registrations.invalid_email') });
        } else if (error.message.toLowerCase().includes('invalid param password')) {
          setErrors({ form: t('registrations.invalid_password') });
        }
        setValue('password', '');
      }
    }

    setSubmitting(false);
  };

  const validationSchema: SchemaOf<RegistrationFormData> = object().shape({
    email: string().email(t('registrations.field_is_not_valid_email')).required(t('registrations.field_required')),
    password: string().required(t('registrations.field_required')),
    termsConditions: boolean().required(t('registrations.field_required')),
    emailUpdates: boolean().required(),
  });
  const initialValues: RegistrationFormData = { email: '', password: '', termsConditions: true, emailUpdates: true };
  const { handleSubmit, handleChange, values, errors, submitting } = useForm<RegistrationFormData>(
    initialValues,
    loginSubmitHandler,
    validationSchema,
  );

  return <RegistrationForm onSubmit={handleSubmit} onChange={handleChange} values={values} errors={errors} submitting={submitting} />;
};

export default Registration;
