import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { ForgotPasswordFormData } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useForm, { type UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';
import { logDebug, logError } from '@jwp/ott-common/src/logger';
import env from '@jwp/ott-common/src/env';

import ResetPasswordForm from '../../../components/ResetPasswordForm/ResetPasswordForm';
import ForgotPasswordForm from '../../../components/ForgotPasswordForm/ForgotPasswordForm';
import ConfirmationForm from '../../../components/ConfirmationForm/ConfirmationForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';

type Prop = {
  type: 'confirmation' | 'forgot' | 'reset' | 'edit';
};

const ResetPassword: React.FC<Prop> = ({ type }: Prop) => {
  const accountController = getModule(AccountController);

  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const location = useLocation();
  const [resetPasswordSubmitting, setResetPasswordSubmitting] = useState<boolean>(false);

  const { canChangePasswordWithOldPassword } = accountController.getFeatures();
  const { customer: user } = useAccountStore(
    ({ user }) => ({
      customer: user,
    }),
    shallow,
  );
  const cancelClickHandler = () => {
    navigate(modalURLFromLocation(location, null));
  };

  const backToLoginClickHandler = async () => {
    navigate(
      {
        pathname: '/',
        search: 'u=login',
      },
      { replace: true },
    );

    if (user) {
      await accountController.logout();
    }
  };

  const resetPasswordClickHandler = async () => {
    const resetUrl = `${env.APP_PUBLIC_URL}/?u=edit-password`;
    try {
      if (!user?.email) {
        logDebug('ResetPassword', 'invalid param email');
        return;
      }

      setResetPasswordSubmitting(true);

      await accountController.resetPassword(user.email, resetUrl);

      setResetPasswordSubmitting(false);
      navigate(modalURLFromLocation(location, 'send-confirmation'));
    } catch (error: unknown) {
      logError('ResetPassword', 'Failed to reset password', { error });
    }
  };

  const emailSubmitHandler: UseFormOnSubmitHandler<ForgotPasswordFormData> = async (formData, { setErrors, setSubmitting }) => {
    const resetUrl = `${env.APP_PUBLIC_URL}/?u=edit-password`;

    try {
      await accountController.resetPassword(formData.email, resetUrl);
      const modal = canChangePasswordWithOldPassword ? 'edit-password' : 'send-confirmation';
      navigate(modalURLFromLocation(location, modal));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('invalid param email')) {
          setErrors({ email: t('reset.wrong_email') });
        } else {
          setErrors({ form: error.message });
        }
      }
    }
    setSubmitting(false);
  };

  const emailForm = useForm<ForgotPasswordFormData>({
    initialValues: { email: '' },
    validationSchema: object().shape({
      email: string()
        .email(t('login.field_is_not_valid_email'))
        .required(t('login.field_required', { field: t('login.email') })),
    }),
    validateOnBlur: true,
    onSubmit: emailSubmitHandler,
  });

  return (
    <React.Fragment>
      {type === 'reset' && <ResetPasswordForm submitting={resetPasswordSubmitting} onCancel={cancelClickHandler} onReset={resetPasswordClickHandler} />}
      {type === 'forgot' && (
        <ForgotPasswordForm
          value={emailForm.values}
          submitting={emailForm.submitting}
          onChange={emailForm.handleChange}
          errors={emailForm.errors}
          onSubmit={emailForm.handleSubmit}
          onBlur={emailForm.handleBlur}
        />
      )}
      {type === 'confirmation' && <ConfirmationForm loggedIn={!!user} email={user?.email || emailForm.values.email} onBackToLogin={backToLoginClickHandler} />}
      {(emailForm.submitting || resetPasswordSubmitting) && <LoadingOverlay transparentBackground inline />}
    </React.Fragment>
  );
};

export default ResetPassword;
