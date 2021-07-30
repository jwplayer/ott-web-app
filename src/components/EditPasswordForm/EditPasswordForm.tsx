import React from 'react';
import { useTranslation } from 'react-i18next';

import type { FormErrors } from '../../../types/form';
import type { PasswordField } from '../../../types/account';
import FormFeedback from '../FormFeedback/FormFeedback';
import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import Visibility from '../../icons/Visibility';
import VisibilityOff from '../../icons/VisibilityOff';
import useToggle from '../../hooks/useToggle';
import PasswordStrength from '../PasswordStrength/PasswordStrength';

import styles from './EditPasswordForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<PasswordField>;
  value: PasswordField;
  submitting: boolean;
};

const EditPasswordForm: React.FC<Props> = ({ onSubmit, onChange, value, errors, submitting }: Props) => {
  const { t } = useTranslation('account');
  const [viewPassword, toggleViewPassword] = useToggle();

  return (
    <form onSubmit={onSubmit} data-testid="forgot-password-form" noValidate className={styles.forgotPasswordForm}>
      <h2 className={styles.title}>{t('reset.password_reset')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      <TextField
        value={value.password}
        onChange={onChange}
        label={t('reset.password')}
        placeholder={t('reset.password')}
        error={!!errors.password || !!errors.form}
        helperText={errors.password}
        name="password"
        type={viewPassword ? 'text' : 'password'}
        rightControl={
          <IconButton aria-label={viewPassword ? t('reset.hide_password') : t('reset.view_password')} onClick={() => toggleViewPassword()}>
            {viewPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        }
        required
      />
      <PasswordStrength password={value.password} />
      <Button type="submit" className={styles.button} fullWidth color="primary" disabled={submitting} label={t('reset.confirm')} />
    </form>
  );
};

export default EditPasswordForm;
