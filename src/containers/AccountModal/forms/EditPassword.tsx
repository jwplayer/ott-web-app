import React from 'react';
import { useHistory } from 'react-router-dom';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';

import { changePassword } from '../../../stores/AccountStore';
import { addQueryParam } from '../../../utils/history';
import useForm, { UseFormOnSubmitHandler } from '../../../hooks/useForm';
import type { EditPasswordFormData } from '../../../../types/account';
import EditPasswordForm from '../../../components/EditPasswordForm/EditPasswordForm';
import useQueryParam from '../../../hooks/useQueryParam';

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
      history.push(addQueryParam(history, 'u', 'login'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('invalid param password')) {
          setErrors({ password: t('reset.invalid_password') });
        } else if (error.message.includes('resetPasswordToken is not valid')) {
          setErrors({ password: t('reset.invalid_token') });
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
