import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ForgotPasswordForm.module.scss';

import Button from '#components/Button/Button';
import TextField from '#components/TextField/TextField';
import type { FormErrors } from '#types/form';
import type { ForgotPasswordFormData } from '#types/account';
import FormFeedback from '#components/FormFeedback/FormFeedback';
import { testId } from '#src/utils/common';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<ForgotPasswordFormData>;
  value: ForgotPasswordFormData;
  submitting: boolean;
};

const ForgotPasswordForm: React.FC<Props> = ({ onSubmit, onChange, value, errors, submitting, onBlur }: Props) => {
  const { t } = useTranslation('account');

  return (
    <form onSubmit={onSubmit} data-testid={testId('forgot-password-form')} noValidate className={styles.forgotPasswordForm}>
      <h2 className={styles.title}>{t('reset.forgot_password')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      <p className={styles.text}>{t('reset.forgot_text')}</p>
      <TextField
        value={value.email}
        onChange={onChange}
        onBlur={onBlur}
        label={t('reset.email')}
        placeholder={t('reset.email')}
        error={!!errors.email || !!errors.form}
        helperText={errors.email}
        required
        name="email"
        type="email"
      />
      <Button type="submit" className={styles.button} fullWidth color="primary" disabled={submitting} label={t('reset.email_me')} />
    </form>
  );
};

export default ForgotPasswordForm;
