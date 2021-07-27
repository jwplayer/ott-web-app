import React from 'react';

import useOpaqueId from '../../hooks/useOpaqueId';

import styles from './Checkbox.module.scss';

type Props = {
  label?: string;
  name: string;
  value: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: string;
};

const Checkbox: React.FC<Props> = ({ label, name, onChange, header }: Props) => {
  const id = useOpaqueId('check-box', name);

  return (
    <div className={styles.checkbox}>
      {header && <span className={styles.header}>{header}</span>}
      <input name={name} type="checkbox" id={id} onChange={onChange} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default Checkbox;
