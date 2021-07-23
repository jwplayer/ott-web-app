import React, { ReactNode } from 'react';

import useOpaqueId from '../../hooks/useOpaqueId';

import styles from './Checkbox.module.scss';

type Props = {
  label?: string | ReactNode;
  name: string;
  value: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const Checkbox: React.FC<Props> = ({ label, name, onChange }: Props) => {
  const id = useOpaqueId('check-box', name);

  return (
    <div className={styles.checkbox}>
      <input name={name} type="checkbox" id={id} onChange={onChange} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default Checkbox;
