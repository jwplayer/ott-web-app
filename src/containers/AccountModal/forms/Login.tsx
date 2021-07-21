import React from 'react';
import { object, string, SchemaOf } from 'yup';
import type { LoginFormData } from 'types/account';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import LoginForm from '../../../components/LoginForm/LoginForm';
import { login } from '../../../stores/AccountStore';
import useForm, { UseFormOnSubmitHandler } from '../../../hooks/useForm';
import { removeQueryParam } from '../../../utils/history';

const Login = () => {
  const history = useHistory();
  const { t } = useTranslation('account');
  const loginSubmitHandler: UseFormOnSubmitHandler<LoginFormData> = async (formData, { setErrors, setSubmitting, setValue }) => {
    try {
      await login(formData.email, formData.password);

      // close modal
      history.push(removeQueryParam(history, 'u'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('invalid param email')) {
          setErrors({ email: t('login.wrong_email') });
        } else {
          setErrors({ form: t('login.wrong_combination') });
        }
        setValue('password', '');
      }
    }

    setSubmitting(false);
  };

  const validationSchema: SchemaOf<LoginFormData> = object().shape({
    email: string().email(t('login.field_is_not_valid_email')).required(t('login.field_required')),
    password: string().required(t('login.field_required')),
  });
  const initialValues: LoginFormData = { email: '', password: '' };
  const { handleSubmit, handleChange, values, errors, submitting } = useForm(initialValues, loginSubmitHandler, validationSchema);

  return <LoginForm onSubmit={handleSubmit} onChange={handleChange} values={values} errors={errors} submitting={submitting} />;
};

export default Login;
