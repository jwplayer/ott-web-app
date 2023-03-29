import React from 'react';
import { useTranslation } from 'react-i18next';

import PasswordField from '../PasswordField/PasswordField';
import TextField from '../TextField/TextField';

import styles from './EditPasswordForm.module.scss';

import type { FormErrors } from '#types/form';
import type { EditPasswordFormData } from '#types/account';
import FormFeedback from '#components/FormFeedback/FormFeedback';
import Button from '#components/Button/Button';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import { testId } from '#src/utils/common';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  setValue?: (key: keyof EditPasswordFormData, value: string) => void;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<EditPasswordFormData>;
  value: EditPasswordFormData;
  submitting: boolean;
  showOldPasswordField?: boolean;
  showResetTokenField?: boolean;
};

const EditPasswordForm: React.FC<Props> = ({ onSubmit, onChange, onBlur, showOldPasswordField, showResetTokenField, value, errors, submitting }: Props) => {
  const { t } = useTranslation('account');
  return (
    <form onSubmit={onSubmit} data-testid={testId('forgot-password-form')} noValidate className={styles.forgotPasswordForm}>
      <h2 className={styles.title}>{t('reset.password_reset')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}

      {showOldPasswordField ? (
        <PasswordField
          value={value.oldPassword}
          onChange={onChange}
          onBlur={onBlur}
          label={t('reset.old_password')}
          placeholder={t('reset.old_password')}
          error={!!errors.oldPassword}
          name="oldPassword"
          showToggleView={false}
          showHelperText={false}
          required
        />
      ) : showResetTokenField ? (
        <TextField
          className={styles.textField}
          value={value.resetPasswordToken}
          onChange={onChange}
          onBlur={onBlur}
          label={t('reset.reset_password_token')}
          placeholder={t('reset.reset_password_token')}
          name="resetPasswordToken"
          type="text"
          required
        />
      ) : null}

      <PasswordField
        value={value.password}
        onChange={onChange}
        onBlur={onBlur}
        label={t('reset.new_password')}
        placeholder={t('reset.password')}
        error={!!errors.password}
        name="password"
        required
      />

      <PasswordField
        value={value.passwordConfirmation}
        onChange={onChange}
        onBlur={onBlur}
        label={t('reset.repeat_new_password')}
        placeholder={t('reset.repeat_new_password')}
        error={!!errors.passwordConfirmation}
        name="passwordConfirmation"
        required
      />

      <Button type="submit" className={styles.button} fullWidth color="primary" disabled={submitting} label={t('reset.confirm')} />
      {submitting && <LoadingOverlay transparentBackground inline />}
    </form>
  );
};

export default EditPasswordForm;
