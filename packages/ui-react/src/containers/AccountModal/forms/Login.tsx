import React from 'react';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useSocialLoginUrls from '@jwp/ott-hooks-react/src/useSocialLoginUrls';
import type { LoginFormData } from '@jwp/ott-common/types/account';

import LoginForm from '../../../components/LoginForm/LoginForm';

type Props = {
  messageKey: string | null;
};

const Login: React.FC<Props> = ({ messageKey }: Props) => {
  const accountController = getModule(AccountController);

  const { siteName } = useConfigStore((s) => s.config);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');

  const socialLoginURLs = useSocialLoginUrls(window.location.href.split('?')[0]);

  const { values, errors, submitting, handleSubmit, handleChange } = useForm<LoginFormData>({
    initialValues: { email: '', password: '' },
    validationSchema: object().shape({
      email: string().email(t('login.field_is_not_valid_email')).required(t('login.field_required')),
      password: string().required(t('login.field_required')),
    }),
    onSubmit: ({ email, password }) => accountController.login(email, password, window.location.href),
    onSubmitSuccess: () => navigate(modalURLFromLocation(location, null)),
    onSubmitError: ({ resetValue }) => resetValue('password'),
  });

  return (
    <LoginForm
      values={values}
      errors={errors}
      submitting={submitting}
      siteName={siteName}
      socialLoginURLs={socialLoginURLs}
      messageKey={messageKey}
      onSubmit={handleSubmit}
      onChange={handleChange}
    />
  );
};

export default Login;
