import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './EditPasswordForm.module.scss';

import type { FormErrors } from '#types/form';
import type { EditPasswordFormData } from '#types/account';
import FormFeedback from '#components/FormFeedback/FormFeedback';
import TextField from '#components/TextField/TextField';
import Button from '#components/Button/Button';
import IconButton from '#components/IconButton/IconButton';
import Visibility from '#src/icons/Visibility';
import VisibilityOff from '#src/icons/VisibilityOff';
import useToggle from '#src/hooks/useToggle';
import PasswordStrength from '#components/PasswordStrength/PasswordStrength';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import { testId } from '#src/utils/common';

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
  const [viewPassword, toggleViewPassword] = useToggle();

  return (
    <form onSubmit={onSubmit} data-testid={testId('forgot-password-form')} noValidate className={styles.forgotPasswordForm}>
      <h2 className={styles.title}>{t('reset.password_reset')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      <TextField
        className={styles.textField}
        value={value.password}
        onChange={onChange}
        onBlur={onBlur}
        label={t('reset.new_password')}
        placeholder={t('reset.password')}
        error={!!errors.password || !!errors.form}
        helperText={
          <React.Fragment>
            <PasswordStrength password={value.password} />
            {t('reset.password_helper_text')}
          </React.Fragment>
        }
        name="password"
        type={viewPassword ? 'text' : 'password'}
        rightControl={
          <IconButton aria-label={viewPassword ? t('reset.hide_password') : t('reset.view_password')} onClick={() => toggleViewPassword()}>
            {viewPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        }
        required
      />
      <Button type="submit" className={styles.button} fullWidth color="primary" disabled={submitting} label={t('reset.confirm')} />
      {submitting && <LoadingOverlay transparentBackground inline />}
    </form>
  );
};

export default EditPasswordForm;
