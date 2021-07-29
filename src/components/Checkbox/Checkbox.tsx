import React from 'react';
import classNames from 'classnames';

import useOpaqueId from '../../hooks/useOpaqueId';

import styles from './Checkbox.module.scss';

type Props = {
  label?: string | JSX.Element;
  name: string;
  value?: string;
  checked?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

const Checkbox: React.FC<Props> = ({ label, name, onChange, header, checked, value, helperText, disabled, error }: Props) => {
  const checkboxClassName = classNames(styles.checkbox, {
    [styles.error]: error,
  });
  const id = useOpaqueId('check-box', name);

  const labelComponent = typeof label === 'string' ? <label htmlFor={id}>{label}</label> : label && React.cloneElement(label, { htmlFor: id });

  return (
    <div className={checkboxClassName}>
      {header && <span className={styles.header}>{header}</span>}
      <input name={name} type="checkbox" id={id} onChange={onChange} value={value} checked={checked} disabled={disabled} />
      {labelComponent}
      {helperText ? <div className={styles.helperText}>{helperText}</div> : null}
    </div>
  );
};

export default Checkbox;
