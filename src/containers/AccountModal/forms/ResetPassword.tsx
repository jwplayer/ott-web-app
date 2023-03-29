import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import { useAccountStore } from '#src/stores/AccountStore';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import ResetPasswordForm from '#components/ResetPasswordForm/ResetPasswordForm';
import ForgotPasswordForm from '#components/ForgotPasswordForm/ForgotPasswordForm';
import type { ForgotPasswordFormData } from '#types/account';
import ConfirmationForm from '#components/ConfirmationForm/ConfirmationForm';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import { addQueryParam, removeQueryParam } from '#src/utils/location';
import { logDev } from '#src/utils/common';
import { logout, resetPassword } from '#src/stores/AccountController';

type Prop = {
  type: 'confirmation' | 'forgot' | 'reset' | 'edit';
};

const ResetPassword: React.FC<Prop> = ({ type }: Prop) => {
  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const location = useLocation();
  const [resetPasswordSubmitting, setResetPasswordSubmitting] = useState<boolean>(false);
  const { customer: user, canChangePasswordWithOldPassword } = useAccountStore(
    ({ user, canChangePasswordWithOldPassword }) => ({
      customer: user,
      canChangePasswordWithOldPassword,
    }),
    shallow,
  );
  const cancelClickHandler = () => {
    navigate(removeQueryParam(location, 'u'));
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
      await logout();
    }
  };

  const resetPasswordClickHandler = async () => {
    const resetUrl = `${window.location.origin}/?u=edit-password`;
    try {
      if (!user?.email) {
        logDev('invalid param email');
        return;
      }

      setResetPasswordSubmitting(true);

      await resetPassword(user.email, resetUrl);

      setResetPasswordSubmitting(false);
      navigate(addQueryParam(location, 'u', 'send-confirmation'));
    } catch (error: unknown) {
      logDev(error instanceof Error ? error.message : error);
    }
  };

  const emailSubmitHandler: UseFormOnSubmitHandler<ForgotPasswordFormData> = async (formData, { setErrors, setSubmitting }) => {
    const resetUrl = `${window.location.origin}/?u=edit-password`;

    try {
      await resetPassword(formData.email, resetUrl);
      const modal = canChangePasswordWithOldPassword ? 'edit-password' : 'send-confirmation';
      navigate(addQueryParam(location, 'u', modal));
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

  const emailForm = useForm(
    { email: '' },
    emailSubmitHandler,
    object().shape({
      email: string().email(t('login.field_is_not_valid_email')).required(t('login.field_required')),
    }),
    true,
  );

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
