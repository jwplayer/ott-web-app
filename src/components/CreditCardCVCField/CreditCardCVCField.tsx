import React from 'react';
import { useTranslation } from 'react-i18next';

import TextField from '../TextField/TextField';

type Props = {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  error?: string;
  value?: string;
};

const CreditCardCVCField: React.FC<Props> = ({ value, onChange, error, ...props }: Props) => {
  const { t } = useTranslation('user');
  const formatCVC: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const clearValue = e.target.value.replace(/\D+/g, '');
    if (onChange) {
      e.target.value = clearValue.slice(0, 4);
      onChange(e);
    }
  };
  return (
    <TextField
      label={t('payment.security_code')}
      aria-label={t('payment.security_code')}
      {...props}
      error={!!error}
      helperText={error ? error : null}
      name="cardCVC"
      className="directPostSecurityCode"
      type="text"
      value={value}
      onChange={formatCVC}
      pattern="\d*"
      placeholder="###"
      required
    />
  );
};

export default CreditCardCVCField;
