import React from 'react';
import { object, SchemaOf, string } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useQueryClient } from 'react-query';

import { useConfigStore } from '#src/stores/ConfigStore';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import LoginForm from '#components/LoginForm/LoginForm';
import { removeQueryParam } from '#src/utils/location';
import type { LoginFormData } from '#types/account';
import { login } from '#src/stores/AccountController';

type Props = {
  messageKey?: string;
};

const Login: React.FC<Props> = ({ messageKey }: Props) => {
  const { siteName } = useConfigStore((s) => s.config);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');

  const queryClient = useQueryClient();

  const loginSubmitHandler: UseFormOnSubmitHandler<LoginFormData> = async (formData, { setErrors, setSubmitting, setValue }) => {
    try {
      await login(formData.email, formData.password);
      await queryClient.invalidateQueries('listProfiles');

      // close modal
      navigate(removeQueryParam(location, 'u'));
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

  return (
    <LoginForm
      messageKey={messageKey}
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitting={submitting}
      siteName={siteName}
    />
  );
};

export default Login;
