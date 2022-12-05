import React from 'react';
import { useNavigate } from 'react-router-dom';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';

import type { EditPasswordFormData } from '#types/account';
import CleengEditPasswordForm from '#components/EditPasswordForm/EditPasswordForm';
import InPlayerEditPasswordForm from '#components/EditPasswordForm/inplayer/EditPasswordForm';
import { changePassword } from '#src/stores/AccountController';
import useQueryParam from '#src/hooks/useQueryParam';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import { addQueryParams } from '#src/utils/formatting';
import useClientIntegration, { ClientIntegrations } from '#src/hooks/useClientIntegration';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const resetPasswordTokenParam = useQueryParam('resetPasswordToken');
  const emailParam = useQueryParam('email');
  const { client } = useClientIntegration();

  const EditPasswordForm = client === ClientIntegrations.INPLAYER ? InPlayerEditPasswordForm : CleengEditPasswordForm;

  const passwordSubmitHandler: UseFormOnSubmitHandler<EditPasswordFormData> = async (formData, { setErrors, setSubmitting }) => {
    if (formData.passwordConfirmation && formData.password !== formData.passwordConfirmation) {
      setErrors({ form: t('reset.passwords_do_not_match') });

      return setSubmitting(false);
    }
    if (client !== ClientIntegrations.INPLAYER && (!emailParam || !resetPasswordTokenParam)) {
      setErrors({ form: t('reset.invalid_link') });

      return setSubmitting(false);
    }
    let resetToken = resetPasswordTokenParam || '';
    if (formData.resetPasswordToken) {
      resetToken = formData.resetPasswordToken;
    }

    try {
      await changePassword({
        customerEmail: emailParam,
        resetPasswordToken: resetToken,
        oldPassword: formData.oldPassword,
        newPassword: formData.password,
        newPasswordConfirmation: formData.passwordConfirmation,
      });
      navigate(addQueryParams(window.location.origin, { u: 'login' }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('invalid param password')) {
          setErrors({ password: t('reset.invalid_password') });
        } else if (error.message.includes('resetPasswordToken is not valid')) {
          setErrors({ form: t('reset.invalid_token') });
        } else if (error.message.includes('Failed to change password')) {
          setErrors({ form: t('reset.failed_to_change') });
        }
      }
    }
    setSubmitting(false);
  };

  const passwordForm = useForm(
    { resetPasswordToken: '', oldPassword: '', password: '', passwordConfirmation: '' },
    passwordSubmitHandler,
    object().shape({
      resetPasswordTokenParam: string(),
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
    />
  );
};

export default ResetPassword;
