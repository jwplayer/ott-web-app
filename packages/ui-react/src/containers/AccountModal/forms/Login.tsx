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
import { useAriaAnnouncer } from '../../AnnouncementProvider/AnnoucementProvider';

type Props = {
  messageKey: string | null;
};

const Login: React.FC<Props> = ({ messageKey }: Props) => {
  const accountController = getModule(AccountController);

  const { siteName } = useConfigStore((s) => s.config);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  const announce = useAriaAnnouncer();

  const socialLoginURLs = useSocialLoginUrls(window.location.href.split('?')[0]);

  const { values, errors, submitting, validationSchemaError, handleSubmit, handleChange } = useForm<LoginFormData>({
    initialValues: { email: '', password: '' },
    validationSchema: object().shape({
      email: string()
        .email(t('login.field_is_not_valid_email'))
        .required(t('login.field_required', { field: t('login.email') })),
      password: string().required(t('login.field_required', { field: t('login.password') })),
    }),
    onSubmit: ({ email, password }) => accountController.login(email, password, window.location.href),
    onSubmitSuccess: () => {
      announce(t('login.sign_in_success'), 'success');

      navigate(modalURLFromLocation(location, null));
    },
    onSubmitError: ({ resetValue }) => resetValue('password'),
  });

  return (
    <LoginForm
      values={values}
      validationError={validationSchemaError}
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
