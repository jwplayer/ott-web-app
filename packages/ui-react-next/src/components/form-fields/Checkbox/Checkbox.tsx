import React, { type InputHTMLAttributes } from 'react';
import classNames from 'classnames';

import { FormField } from '../../FormField/FormField';
import type { FormControlProps } from '../../../types/form';

import styles from './Checkbox.module.scss';

type HTMLCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type Props = HTMLCheckboxProps & {
  checkboxLabel?: React.ReactNode;
  helperText?: React.ReactNode;
} & FormControlProps;

const Checkbox: React.FC<Props> = ({
  className,
  label,
  checkboxLabel,
  name,
  onChange,
  editing = true,
  value,
  helperText,
  error,
  required,
  lang,
  size,
  ...rest
}) => {
  const fieldClassName = classNames(styles.checkbox, { [styles.error]: error }, className);
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!editing) {
      return event.preventDefault();
    }
    onChange?.(event);
  };

  return (
    <FormField
      className={fieldClassName}
      name={name}
      label={label}
      editing={editing}
      required={required}
      error={error}
      helperText={helperText}
      renderInput={({ id, helperTextId }) => (
        <div className={styles.row}>
          <input
            name={name}
            type="checkbox"
            id={id}
            value={value}
            aria-required={required}
            aria-describedby={helperTextId}
            {...rest}
            onChange={handleChange}
            readOnly={!editing}
          />
          <label htmlFor={id} lang={lang}>
            {required ? (
              <span role="presentation" aria-hidden="true">
                *
              </span>
            ) : (
              ''
            )}
            {checkboxLabel}
          </label>
        </div>
      )}
    />
  );
};

export default Checkbox;
