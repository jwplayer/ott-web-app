import React, { type InputHTMLAttributes } from 'react';
import classNames from 'classnames';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import type { FormControlProps } from '../../types/form';

import styles from './Select.module.scss';

type HTMLSelectProps = Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'>;

type Props = HTMLSelectProps & {
  helperTextId?: string;
  options?: (string | { value: string; label: string })[];
  optionsStyle?: string;
  defaultLabel?: string;
} & FormControlProps;

const Select = ({
  id,
  required,
  className,
  disabled,
  label,
  defaultLabel,
  options,
  optionsStyle,
  editing = true,
  value,
  onChange,
  name,
  error,
  helperTextId,
  type,
  ...rest
}: Props) => {
  const opaqueId = useOpaqueId('select', name);
  const elementId = id || opaqueId;
  const accessibilityLabel = label || defaultLabel;

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
      {accessibilityLabel && (
        <label htmlFor={elementId} className="hidden">
          {accessibilityLabel}
        </label>
      )}
      <select id={elementId} {...inputProps} onChange={handleChange}>
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
