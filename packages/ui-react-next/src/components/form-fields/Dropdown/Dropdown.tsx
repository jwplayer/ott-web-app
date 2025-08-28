import React, { type InputHTMLAttributes } from 'react';

import { FormField } from '../../FormField/FormField';
import Select from '../../Select/Select';
import type { FormControlProps } from '../../../types/form';

type SelectProps = Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'>;

type Props = SelectProps & {
  defaultLabel?: string;
  options?: (string | { value: string; label: string })[];
  optionsStyle?: string;
  helperText?: React.ReactNode;
} & FormControlProps;

const Dropdown: React.FC<Props> = ({
  name,
  className,
  label,
  error,
  helperText,
  editing = true,
  required = false,
  size = 'medium',
  testId,
  lang,
  ...inputProps
}) => {
  return (
    <FormField
      className={className}
      error={error}
      helperText={helperText}
      label={label}
      required={required}
      editing={editing}
      testId={testId}
      name={name}
      size={size}
      lang={lang}
      renderInput={(fieldProps) => <Select name={name} required={required} editing={editing} error={error} size={size} {...fieldProps} {...inputProps} />}
    />
  );
};

export default Dropdown;
