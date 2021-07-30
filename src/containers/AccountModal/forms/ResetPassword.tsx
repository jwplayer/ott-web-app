import React from 'react';
import { useHistory } from 'react-router-dom';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';

import { resetPassword, AccountStore, changePassword } from '../../../stores/AccountStore';
import { removeQueryParam, addQueryParam } from '../../../utils/history';
import ResetPasswordForm from '../../../components/ResetPasswordForm/ResetPasswordForm';
import useForm, { UseFormOnSubmitHandler } from '../../../hooks/useForm';
import ForgotPasswordForm from '../../../components/ForgotPasswordForm/ForgotPasswordForm';
import type { EmailField, PasswordField } from '../../../../types/account';
import EditPasswordForm from '../../../components/EditPasswordForm/EditPasswordForm';
import useQueryParam from '../../../hooks/useQueryParam';

type Prop = {
  type: 'confirmation' | 'forgot' | 'reset' | 'edit';
};

const ResetPassword: React.FC<Prop> = ({ type }: Prop) => {
  const { t } = useTranslation('account');
  const history = useHistory();
  const user = AccountStore.useState((state) => state.user);
  const resetPasswordTokenParam = useQueryParam('resetPasswordToken');
  const emailParam = useQueryParam('email');

  const cancelClickHandler = () => {
    history.push(removeQueryParam(history, 'u'));
  };

  const resetPasswordClickHandler = async () => {
    const resetUrl = `${window.location.origin}/u/my-account?u=edit-password`;

    try {
      if (!user?.email) throw new Error('invalid param email');

      await resetPassword(user.email, resetUrl);

      history.push('/u/logout');
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('invalid param email')) {
          console.info(error.message);
        }
      }
    }
  };

  const emailSubmitHandler: UseFormOnSubmitHandler<EmailField> = async (formData, { setErrors, setSubmitting }) => {
    const resetUrl = `${window.location.origin}/u/my-account?u=edit-password`;

    try {
      await resetPassword(formData.email, resetUrl);
      history.push(addQueryParam(history, 'u', 'send-confirmation'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('invalid param email')) {
          setErrors({ email: t('reset.wrong_email') });
        }
      }
    }
    setSubmitting(false);
  };

  const passwordSubmitHandler: UseFormOnSubmitHandler<PasswordField> = async (formData, { setErrors, setSubmitting, setValue }) => {
    try {
      if (!resetPasswordTokenParam || !emailParam) throw new Error('invalid reset link');

      await changePassword(emailParam, formData.password, resetPasswordTokenParam);
      history.push(addQueryParam(history, 'u', 'login'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('invalid param password')) {
          setErrors({ password: t('reset.invalid_password') });
        } else if (error.message.includes('resetPasswordToken is not valid')) {
          setErrors({ password: t('reset.invalid_token') });
        } else if (error.message.includes('invalid reset link')) {
          setErrors({ password: t('reset.invalid_link') });
        }

        setValue('password', '');
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
  );

  const passwordForm = useForm(
    { password: '' },
    passwordSubmitHandler,
    object().shape({
      password: string().required(t('login.field_required')),
    }),
  );

  return (
    <React.Fragment>
      {type === 'reset' && <ResetPasswordForm onCancel={cancelClickHandler} onReset={resetPasswordClickHandler} />}
      {(type === 'forgot' || type === 'confirmation') && (
        <ForgotPasswordForm
          value={emailForm.values}
          submitting={emailForm.submitting}
          onChange={emailForm.handleChange}
          errors={emailForm.errors}
          onSubmit={emailForm.handleSubmit}
          type={type}
        />
      )}
      {type === 'edit' && (
        <EditPasswordForm
          value={passwordForm.values}
          submitting={passwordForm.submitting}
          onChange={passwordForm.handleChange}
          errors={passwordForm.errors}
          onSubmit={passwordForm.handleSubmit}
        />
      )}
    </React.Fragment>
  );
};

export default ResetPassword;
