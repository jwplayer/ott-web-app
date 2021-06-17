import React from 'react';
import classNames from 'classnames';

import styles from './Dropdown.module.scss';

type Props = {
  name: string;
  value: string;
  defaultLabel: string;
  options: string[];
  optionsStyle?: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

const Dropdown: React.FC<Props & React.AriaAttributes> = (
  {
    name,
    value,
    defaultLabel,
    options,
    onChange,
    optionsStyle,
    ...rest
  }: Props & React.AriaAttributes
) => {
  return (
    <div className={styles.dropdown}>
      <select className={styles.select} name={name} value={value} onChange={onChange} {...rest}>
        <option className={classNames(styles.option, optionsStyle)} value="">
          {defaultLabel}
        </option>
        {options.map((option) => (
          <option className={classNames(styles.option, optionsStyle)} key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="focus" />
    </div>
  );
};

export default Dropdown;
