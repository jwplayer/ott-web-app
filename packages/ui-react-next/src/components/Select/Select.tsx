import React, { type InputHTMLAttributes } from 'react';
import classNames from 'classnames';

import type { FormControlProps } from '../../types/form';

import styles from './Select.module.scss';

type HTMLSelectProps = Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'>;

type Props = HTMLSelectProps & {
  id?: string;
  helperTextId?: string;
  options?: (string | { value: string; label: string })[];
  optionsStyle?: string;
  defaultLabel?: string;
} & FormControlProps;

const Select = ({
  required,
  className,
  disabled,
  defaultLabel,
  options,
  optionsStyle,
  editing = true,
  value,
  onChange,
  id,
  name,
  error,
  helperTextId,
  type,
  ...rest
}: Props) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editing) {
      return event.preventDefault();
    }
    onChange?.(event);
  };

  // Default to 'text' if 'type' property is absent, which occurs in textareas.
  const containerClassName = classNames(
    styles.container,
    {
      [styles.error]: error,
      [styles.disabled]: disabled,
    },
    className,
  );

  const ariaAttributes = {
    'aria-required': !!required,
    'aria-invalid': Boolean(required && error && value !== ''),
    'aria-describedby': helperTextId,
  } as const;

  const inputProps: HTMLSelectProps = {
    id,
    name,
    value,
    disabled,
    className: styles.select,
    readOnly: !editing,
    required: required,
    ...ariaAttributes,
    ...rest,
  };

  return (
    <div className={classNames({ [containerClassName]: editing })}>
      <select {...inputProps} onChange={handleChange}>
        {defaultLabel && (
          <option className={classNames(styles.option, optionsStyle)} value="" disabled={required}>
            {defaultLabel}
          </option>
        )}
        {options &&
          options.map((option) => (
            <option
              className={classNames(styles.option, optionsStyle)}
              key={typeof option === 'string' ? option : option.value}
              value={typeof option === 'string' ? option : option.value}
            >
              {typeof option === 'string' ? option : option.label}
            </option>
          ))}
      </select>
    </div>
  );
};

export default Select;
