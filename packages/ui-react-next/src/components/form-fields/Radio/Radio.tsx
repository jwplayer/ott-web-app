import React, { type InputHTMLAttributes } from 'react';
import classNames from 'classnames';

import type { FormControlProps } from '../../../types/form';
import { FormField } from '../../FormField/FormField';

import styles from './Radio.module.scss';

type HTMLRadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type Props = HTMLRadioProps & {
  values: { value: string; label: string }[];
  helperText?: React.ReactNode;
} & FormControlProps;

const Radio: React.FC<Props> = ({ name, onChange, label, value, editing = true, size, values, helperText, error, required, disabled, lang, ...rest }) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!editing) {
      return event.preventDefault();
    }
    onChange?.(event);
  };

  return (
    <FormField
      name={name}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      renderInput={({ id, helperTextId }) => (
        <div id={id}>
          {values.map(({ value: optionValue, label: optionLabel }, index) => (
            <div className={classNames(styles.radio, { [styles.error]: error })} key={index} lang={lang}>
              <input
                value={optionValue}
                name={name}
                type="radio"
                id={id + index}
                onChange={handleChange}
                checked={value === optionValue}
                required={required}
                disabled={disabled}
                aria-describedby={helperTextId}
                {...rest}
              />
              <label htmlFor={id + index}>{optionLabel}</label>
            </div>
          ))}
        </div>
      )}
    />
  );
};

export default Radio;
