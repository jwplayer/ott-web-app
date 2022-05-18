import React from 'react';
import { useHistory } from 'react-router-dom';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';

import type { EditPasswordFormData } from '#types/account';
import EditPasswordForm from '#src/components/EditPasswordForm/EditPasswordForm';
import { changePassword } from '#src/stores/AccountController';
import useQueryParam from '#src/hooks/useQueryParam';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import { addQueryParams } from '#src/utils/formatting';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation('account');
  const history = useHistory();
  const resetPasswordTokenParam = useQueryParam('resetPasswordToken');
  const emailParam = useQueryParam('email');

  const passwordSubmitHandler: UseFormOnSubmitHandler<EditPasswordFormData> = async (formData, { setErrors, setSubmitting, setValue }) => {
    if (!emailParam || !resetPasswordTokenParam) {
      setErrors({ form: t('reset.invalid_link') });

      return setSubmitting(false);
    }

    try {
      await changePassword(emailParam, formData.password, resetPasswordTokenParam);
      history.push(addQueryParams(window.location.origin, { u: 'login' }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('invalid param password')) {
          setErrors({ password: t('reset.invalid_password') });
        } else if (error.message.includes('resetPasswordToken is not valid')) {
          setErrors({ form: t('reset.invalid_token') });
        }

        setValue('password', '');
      }
    }
    setSubmitting(false);
  };

  const passwordForm = useForm(
    { password: '' },
    passwordSubmitHandler,
    object().shape({
      password: string()
        .matches(/^(?=.*[a-z])(?=.*[0-9]).{8,}$/, t('registration.invalid_password'))
        .required(t('login.field_required')),
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
