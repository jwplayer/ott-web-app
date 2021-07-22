import React from 'react';
import classNames from 'classnames';

import useOpaqueId from '../../hooks/useOpaqueId';

import styles from './TextField.module.scss';

type Props = {
  className?: string;
  label?: string;
  placeholder?: string;
  name?: string;
  value: string;
  type?: 'text' | 'email' | 'password' | 'search';
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  helperText?: React.ReactNode;
  leftControl?: React.ReactNode;
  rightControl?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
  editing?: boolean;
};

const TextField: React.FC<Props> = ({
  className,
  label,
  error,
  helperText,
  multiline,
  leftControl,
  rightControl,
  type = 'text',
  rows = 3,
  editing = true,
  value,
  ...rest
}: Props) => {
  const id = useOpaqueId('text-field', rest.name);
  const InputComponent = multiline ? 'textarea' : 'input';
  const textFieldClassName = classNames(
    styles.textField,
    {
      [styles.error]: error,
      [styles.disabled]: rest.disabled,
      [styles.leftControl]: !!leftControl,
      [styles.rightControl]: !!rightControl,
    },
    className,
  );

  const inputProps: Partial<Props & { id: string }> = {
    id,
    type,
    value,
    ...rest,
  };

  if (multiline) {
    inputProps.rows = rows;
  }

  return (
    <div className={textFieldClassName}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {editing ? (
        <div className={styles.container}>
          {leftControl ? <div className={styles.control}>{leftControl}</div> : null}
          <InputComponent className={styles.input} {...inputProps} />
          {rightControl ? <div className={styles.control}>{rightControl}</div> : null}
        </div>
      ) : (
        <p>{value}</p>
      )}
      {helperText ? <div className={styles.helperText}>{helperText}</div> : null}
    </div>
  );
};

export default TextField;
