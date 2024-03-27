import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import type { EditPasswordFormData } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import useForm, { type UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useQueryParam from '@jwp/ott-ui-react/src/hooks/useQueryParam';

import EditPasswordForm from '../../../components/EditPasswordForm/EditPasswordForm';
import { useAriaAnnouncer } from '../../AnnouncementProvider/AnnoucementProvider';

const ResetPassword = ({ type }: { type?: 'add' }) => {
  const accountController = getModule(AccountController);

  const { t } = useTranslation('account');
  const announce = useAriaAnnouncer();
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

      announce(t('reset.password_reset_success'), 'success');
      await accountController.logout();
      navigate(modalURLFromLocation(location, 'login'));
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

  const passwordForm = useForm<EditPasswordFormData>({
    initialValues: { password: '', passwordConfirmation: '' },
    validationSchema: object().shape({
      email: string(),
      oldPassword: string(),
      password: string()
        .matches(/^(?=.*[a-z])(?=.*[0-9]).{8,}$/, t('registration.invalid_password'))
        .required(t('login.field_required', { field: t('login.password') })),
      passwordConfirmation: string().required(),
      resetPasswordToken: string(),
    }),
    validateOnBlur: true,
    onSubmit: passwordSubmitHandler,
  });

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
      validationError={passwordForm.validationSchemaError}
      showOldPasswordField={!!(user && !resetPasswordTokenParam)}
      showResetTokenField={type === 'add' || (!user && !resetPasswordTokenParam)}
      email={emailParam || email}
      onResendEmailClick={resendEmailClickHandler}
    />
  );
};

export default ResetPassword;
