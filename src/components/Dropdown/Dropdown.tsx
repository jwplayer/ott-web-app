import React, { SyntheticEvent } from 'react';
import classNames from 'classnames';

import styles from './Dropdown.module.scss';

type Props = {
  name: string;
  value: string;
  defaultLabel: string;
  options: string[];
  optionsStyle?: string;
  onClick: (event: SyntheticEvent) => void;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

const Dropdown: React.FC<Props> = ({ name, value, defaultLabel, options, onClick, onChange, optionsStyle }: Props) => {
  return (
    <div className={styles.dropdown} tabIndex={0}>
      <select className={styles.select} name={name} value={value} onClick={onClick} onChange={onChange} tabIndex={-1}>
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
