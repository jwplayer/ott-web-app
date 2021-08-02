import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import useOpaqueId from '../../hooks/useOpaqueId';

import styles from './Dropdown.module.scss';

type Props = {
  name: string;
  value: string;
  defaultLabel?: string;
  options?: string[];
  optionsStyle?: string;
  valuePrefix?: string;
  label?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
  required?: boolean;
  onChange: React.ChangeEventHandler;
};

const Dropdown: React.FC<Props & React.AriaAttributes> = ({
  name,
  value,
  defaultLabel,
  options,
  onChange,
  optionsStyle,
  label,
  fullWidth,
  valuePrefix,
  error,
  helperText,
  required = false,
  size = 'medium',
  ...rest
}: Props & React.AriaAttributes) => {
  const { t } = useTranslation('common');
  const id = useOpaqueId();

  return (
    <div className={classNames(styles.container, { [styles.fullWidth]: fullWidth, [styles.error]: error }, styles[size])}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {!required ? <span>{t('optional')}</span> : null}
        </label>
      )}
      <div className={classNames(styles.dropdown, { [styles.fullWidth]: fullWidth })}>
        <select id={id} className={styles.select} name={name} value={value} onChange={onChange} {...rest}>
          {defaultLabel && (
            <option className={classNames(styles.option, optionsStyle)} value="">
              {defaultLabel}
            </option>
          )}
          {options &&
            options.map((option) => (
              <option className={classNames(styles.option, optionsStyle)} key={option} value={option} aria-required={required}>
                {valuePrefix}
                {option}
              </option>
            ))}
        </select>
      </div>
      {helperText ? <div className={styles.helperText}>{helperText}</div> : null}
    </div>
  );
};

export default Dropdown;
