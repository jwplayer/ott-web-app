import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Radio.module.scss';

import HelperText from '#components/HelperText/HelperText';
import useOpaqueId from '#src/hooks/useOpaqueId';

type Props = {
  name: string;
  value?: string;
  values: string[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
};

const Radio: React.FC<Props> = ({ name, onChange, header, value, values, helperText, error, required }: Props) => {
  const { t } = useTranslation('common');
  const id = useOpaqueId('radio', name);

  return (
    <div className={error ? styles.error : undefined}>
      {header ? (
        <div className={styles.header}>
          {header}
          {!required ? <span>{t('optional')}</span> : null}
        </div>
      ) : null}
      {values.map((optionValue, index) => (
        <div className={styles.radio} key={index}>
          <input value={optionValue} name={name} type="radio" id={id + index} onChange={onChange} checked={value === optionValue} required={required} />
          <label htmlFor={id + index}>{optionValue}</label>
        </div>
      ))}
      <HelperText error={error}>{helperText}</HelperText>
    </div>
  );
};

export default Radio;
