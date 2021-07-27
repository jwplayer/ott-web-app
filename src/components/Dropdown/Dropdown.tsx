import React from 'react';
import classNames from 'classnames';

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
  ...rest
}: Props & React.AriaAttributes) => {
  const id = useOpaqueId();
  return (
    <div className={classNames(styles.container, { [styles.fullWidth]: fullWidth })}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
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
              <option className={classNames(styles.option, optionsStyle)} key={option} value={option}>
                {valuePrefix}
                {option}
              </option>
            ))}
        </select>
        <span className="focus" />
      </div>
    </div>
  );
};

export default Dropdown;
