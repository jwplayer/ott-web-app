import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';

import type { EditPasswordFormData } from '#types/account';
import EditPasswordForm from '#components/EditPasswordForm/EditPasswordForm';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import { addQueryParam } from '#src/utils/location';
import { useAccountStore } from '#src/stores/AccountStore';
import useQueryParam from '#src/hooks/useQueryParam';
import AccountController from '#src/stores/AccountController';
import { getModule } from '#src/modules/container';

const ResetPassword = ({ type }: { type?: 'add' }) => {
  const accountController = getModule(AccountController);

  const { t } = useTranslation('account');
  const location = useLocation();
  const navigate = useNavigate();
  const resetPasswordTokenParam = useQueryParam('resetPasswordToken');
  const emailParam = useQueryParam('email');
  const email = useAccountStore((state) => state.user?.email);
  const user = useAccountStore.getState().user;

  const passwordSubmitHandler: UseFormOnSubmitHandler<EditPasswordFormData> = async (formData, { setErrors, setSubmitting }) => {
    const { oldPassword, password, passwordConfirmation, resetPasswordToken } = formData;
    if (password !== passwordConfirmation) {
      setErrors({ form: t('reset.passwords_do_not_match') });

      return setSubmitting(false);
    }
    let resetToken = resetPasswordTokenParam;
    if (resetPasswordToken) {
      resetToken = resetPasswordToken;
    }
    try {
      if (user && !resetToken) {
        await accountController.changePasswordWithOldPassword(oldPassword || '', password, passwordConfirmation);
      } else {
        if (!resetToken) {
          setErrors({ form: t('reset.invalid_link') });

          return setSubmitting(false);
        }
        await accountController.changePasswordWithToken(emailParam || '', password, resetToken, passwordConfirmation);
      }
      await accountController.logout({ includeNetworkRequest: false });
      navigate(addQueryParam(location, 'u', 'login'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('invalid param password')) {
          setErrors({ password: t('reset.invalid_password') });
        } else if (error.message.includes('resetPasswordToken is not valid')) {
          setErrors({ form: t('reset.invalid_reset_link') });
        } else if (error.message.includes('score does not match standards')) {
          setErrors({ form: t('reset.password_strength') });
        } else if (error.message.includes('password could not be set')) {
          setErrors({ form: t('reset.invalid_token') });
        }
      }
    }
    setSubmitting(false);
  };

  const passwordForm = useForm(
    { password: '', passwordConfirmation: '' },
    passwordSubmitHandler,
    object().shape({
      email: string(),
      oldPassword: string(),
      password: string()
        .matches(/^(?=.*[a-z])(?=.*[0-9]).{8,}$/, t('registration.invalid_password'))
        .required(t('login.field_required')),
      passwordConfirmation: string(),
    }),
    true,
  );

  const resendEmailClickHandler = async () => {
    try {
      if (email) {
        await accountController.resetPassword(email, '');
      }
    } catch (error: unknown) {
      passwordForm.setErrors({ form: t('user:account.resend_mail_error') });
    }
  };

  return (
    <EditPasswordForm
      value={passwordForm.values}
      submitting={passwordForm.submitting}
      onChange={passwordForm.handleChange}
      onBlur={passwordForm.handleBlur}
      errors={passwordForm.errors}
      onSubmit={passwordForm.handleSubmit}
      showOldPasswordField={!!(user && !resetPasswordTokenParam)}
      showResetTokenField={type === 'add' || (!user && !resetPasswordTokenParam)}
      email={emailParam || email}
      onResendEmailClick={resendEmailClickHandler}
    />
  );
};

export default ResetPassword;
