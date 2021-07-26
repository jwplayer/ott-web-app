import React from 'react';

import MarkdownComponent from '../MarkdownComponent/MarkdownComponent';

import styles from './Checkbox.module.scss';

type Props = {
  name: string;
  label: string;
  value: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
};

const Checkbox: React.FC<Props> = ({ name, checked, value, onChange, disabled, label }: Props) => {
  return (
    <label className={styles.checkbox}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles.checkmark} />
      <MarkdownComponent markdownString={label} className={styles.checkLabel} />
    </label>
  );
};

export default Checkbox;
