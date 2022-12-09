import React from 'react';
import { useNavigate } from 'react-router-dom';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';

import type { EditPasswordFormData } from '#types/account';
import EditPasswordForm from '#components/EditPasswordForm/EditPasswordForm';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import { addQueryParams } from '#src/utils/formatting';
import { useAccountStore } from '#src/stores/AccountStore';
import { changePasswordWithOldPassword, changePasswordWithToken, logout } from '#src/stores/AccountController';
import useQueryParam from '#src/hooks/useQueryParam';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const resetPasswordTokenParam = useQueryParam('resetPasswordToken');
  const emailParam = useQueryParam('email');
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
        await changePasswordWithOldPassword(oldPassword || '', password, passwordConfirmation);
      } else {
        if (!resetToken) {
          setErrors({ form: t('reset.invalid_link') });

          return setSubmitting(false);
        }
        await changePasswordWithToken(emailParam || '', password, resetToken, passwordConfirmation);
      }
      await logout();
      navigate(addQueryParams(window.location.origin, { u: 'login' }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('invalid param password')) {
          setErrors({ password: t('reset.invalid_password') });
        } else if (error.message.includes('resetPasswordToken is not valid')) {
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

  return (
    <EditPasswordForm
      value={passwordForm.values}
      submitting={passwordForm.submitting}
      onChange={passwordForm.handleChange}
      onBlur={passwordForm.handleBlur}
      errors={passwordForm.errors}
      onSubmit={passwordForm.handleSubmit}
      showOldPasswordField={user && !resetPasswordTokenParam ? true : false}
      showResetTokenField={!user && !resetPasswordTokenParam}
    />
  );
};

export default ResetPassword;
