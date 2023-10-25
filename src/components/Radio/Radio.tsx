import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Radio.module.scss';

import HelperText from '#components/HelperText/HelperText';
import useOpaqueId from '#src/hooks/useOpaqueId';

type Props = {
  name: string;
  value?: string;
  values: { value: string; label: string }[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: ReactNode;
  helperText?: string;
  error?: boolean;
  required?: boolean;
};

const Radio: React.FC<Props> = ({ name, onChange, header, value, values, helperText, error, required, ...rest }: Props) => {
  const { t } = useTranslation('common');
  const id = useOpaqueId('radio', name);

  return (
    <div className={error ? styles.error : undefined} {...rest}>
      {header || !required ? (
        <div className={styles.header} data-testid="radio-header">
          {header}
          {!required ? <span>{t('optional')}</span> : null}
        </div>
      ) : null}
      {values.map(({ value: optionValue, label: optionLabel }, index) => (
        <div className={styles.radio} key={index}>
          <input value={optionValue} name={name} type="radio" id={id + index} onChange={onChange} checked={value === optionValue} required={required} />
          <label htmlFor={id + index}>{optionLabel}</label>
        </div>
      ))}
      <HelperText error={error}>{helperText}</HelperText>
    </div>
  );
};

export default Radio;
