import React from 'react';

import TextField from '../TextField/TextField';

type Props = {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  error?: string;
  value?: string;
};

const CreditCardCVCField: React.FC<Props> = ({ value, onChange, error, ...props }: Props) => {
  const formatCVC: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const clearValue = e.target.value.replace(/\D+/g, '');
    if (onChange) {
      e.target.value = clearValue.slice(0, 4);
      onChange(e);
    }
  };
  return (
    <TextField
      label={`CVC/CVV`}
      {...props}
      error={!!error}
      helperText={error ? error : null}
      name="cardCVC"
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
