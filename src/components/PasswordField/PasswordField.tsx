import React from 'react';
import { useTranslation } from 'react-i18next';

import TextField from '../TextField/TextField';
import PasswordStrength from '../PasswordStrength/PasswordStrength';
import IconButton from '../IconButton/IconButton';

import useToggle from '#src/hooks/useToggle';
import Visibility from '#src/icons/Visibility';
import VisibilityOff from '#src/icons/VisibilityOff';

type Props = {
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: boolean;
  value?: string;
  label?: string;
  placeholder?: string;
  name: string;
  required?: boolean;
  showToggleView?: boolean;
  showHelperText?: boolean;
};

const PasswordField: React.FC<Props> = ({ value, showToggleView = true, showHelperText = true, ...props }: Props) => {
  const { t } = useTranslation('account');
  const [viewPassword, toggleViewPassword] = useToggle();

  return (
    <TextField
      {...props}
      helperText={
        showHelperText ? (
          <React.Fragment>
            <PasswordStrength password={value || ''} />
            {t('reset.password_helper_text')}
          </React.Fragment>
        ) : null
      }
      type={viewPassword ? 'text' : 'password'}
      rightControl={
        showToggleView ? (
          <IconButton aria-label={viewPassword ? t('reset.hide_password') : t('reset.view_password')} onClick={() => toggleViewPassword()}>
            {viewPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        ) : null
      }
      required
    />
  );
};

export default PasswordField;
