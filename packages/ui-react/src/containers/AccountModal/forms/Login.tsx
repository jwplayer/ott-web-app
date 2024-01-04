import React from 'react';
import { object, SchemaOf, string } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useQueryClient } from 'react-query';
import type { LoginFormData } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import { removeQueryParam } from '@jwp/ott-ui-react/src/utils/location';
import useForm, { UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';

import LoginForm from '../../../components/LoginForm/LoginForm';

type Props = {
  messageKey?: string;
};

const Login: React.FC<Props> = ({ messageKey }: Props) => {
  const accountController = getModule(AccountController);

  const { siteName } = useConfigStore((s) => s.config);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');

  const queryClient = useQueryClient();

  const loginSubmitHandler: UseFormOnSubmitHandler<LoginFormData> = async (formData, { setErrors, setSubmitting, setValue }) => {
    try {
      await accountController.login(formData.email, formData.password);
      await queryClient.invalidateQueries(['listProfiles']);

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
