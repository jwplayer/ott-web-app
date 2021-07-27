import React from 'react';

import useOpaqueId from '../../hooks/useOpaqueId';

import styles from './Radio.module.scss';

type Props = {
  name: string;
  values?: string[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: string;
};

const Radio: React.FC<Props> = ({ name, onChange, header, values }: Props) => {
  const id = useOpaqueId('radio', name);

  return (
    <div className={styles.container}>
      {header && <span className={styles.header}>{header}</span>}
      {values &&
        values.map((value, index) => (
          <div className={styles.radio} key={index}>
            <input value={value} name={name} type="radio" id={id + value} onChange={onChange} />
            <label htmlFor={id + value}>{value}</label>
          </div>
        ))}
    </div>
  );
};

export default Radio;
