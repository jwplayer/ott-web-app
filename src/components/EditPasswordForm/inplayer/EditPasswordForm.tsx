import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../EditPasswordForm.module.scss';

import type { FormErrors } from '#types/form';
import type { EditPasswordFormData } from '#types/account';
import FormFeedback from '#components/FormFeedback/FormFeedback';
import TextField from '#components/TextField/TextField';
import Button from '#components/Button/Button';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import { testId } from '#src/utils/common';
import PasswordField from '#src/components/PasswordField/PasswordField';
import { useAccountStore } from '#src/stores/AccountStore';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<EditPasswordFormData>;
  value: EditPasswordFormData;
  submitting: boolean;
};

const EditPasswordForm: React.FC<Props> = ({ onSubmit, onChange, onBlur, value, errors, submitting }: Props) => {
  const { t } = useTranslation('account');
  const user = useAccountStore.getState().user;

  return (
    <form onSubmit={onSubmit} data-testid={testId('change-password-form')} noValidate className={styles.forgotPasswordForm}>
      <h2 className={styles.title}>{t('reset.password_reset')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      {!user ? (
        <TextField
          className={styles.textField}
          value={value.resetPasswordToken}
          onChange={onChange}
          onBlur={onBlur}
          label={t('reset.reset_password_token')}
          placeholder={t('reset.reset_password_token')}
          error={!!errors.resetPasswordToken}
          name="resetPasswordToken"
          type="text"
          required
        />
      ) : (
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
      )}

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
        label={t('reset.new_password')}
        placeholder={t('reset.password')}
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
