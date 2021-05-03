import React from 'react';

import styles from './Dropdown.module.scss';

type DropdownProps = {
  name: string;
  value: string;
  defaultLabel: string;
  options: string[];
  setValue: ((value: string) => void);
};

function Dropdown({
  name,
  value,
  defaultLabel,
  options,
  setValue
}: DropdownProps) {

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => setValue(event.target.value)

  return (
    <div className={styles.dropdown}>
      <select className={styles.select} name={name} value={value} onChange={handleChange}>
        <option value="">{defaultLabel}</option>
        {options.map(option => <option className={styles.option} key={option} value={option}>{option}</option>)}
      </select>
      <span className="focus"></span>
    </div>
  );
}

export default Dropdown;
