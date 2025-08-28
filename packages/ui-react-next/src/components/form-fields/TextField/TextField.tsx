import React, { type InputHTMLAttributes } from 'react';
import classNames from 'classnames';

import { FormField } from '../../FormField/FormField';
import Input from '../../Input/Input';
import type { FormControlProps } from '../../../types/form';

import styles from './TextField.module.scss';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type Props = InputProps & {
  helperText?: React.ReactNode;
  multiline?: boolean;
  leftControl?: React.ReactNode;
  rightControl?: React.ReactNode;
} & FormControlProps;

const TextField: React.FC<Props> = ({ className, helperText, label, error, required, editing = true, testId, name, ...inputProps }) => {
  return (
    <FormField
      className={classNames(styles.textField, className)}
      error={error}
      helperText={helperText}
      label={label}
      required={required}
      editing={editing}
      testId={testId}
      name={name}
      renderInput={(fieldProps) => <Input editing={editing} error={error} name={name} required={required} {...fieldProps} {...inputProps} />}
    />
  );
};

export default TextField;
