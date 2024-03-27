import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import HelperText from '../HelperText/HelperText';

import styles from './Radio.module.scss';

type Props = {
  name: string;
  value?: string;
  values: { value: string; label: string }[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: ReactNode;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  lang?: string;
};

const Radio: React.FC<Props> = ({ name, onChange, header, value, values, helperText, error, required, disabled, lang, ...rest }: Props) => {
  const { t } = useTranslation('common');
  const id = useOpaqueId('radio', name);

  return (
    <div className={error ? styles.error : undefined} {...rest}>
      {header || !required ? (
        <label className={styles.header} htmlFor={id} data-testid="radio-header">
          <span lang={lang}>{header}</span>
          {!required ? <span className={styles.note}>{t('optional')}</span> : null}
        </label>
      ) : null}
      {values.map(({ value: optionValue, label: optionLabel }, index) => (
        <div className={styles.radio} key={index} lang={lang}>
          <input
            value={optionValue}
            name={name}
            type="radio"
            id={id + index}
            onChange={onChange}
            checked={value === optionValue}
            required={required}
            disabled={disabled}
          />
          <label htmlFor={id + index}>{optionLabel}</label>
        </div>
      ))}
      <HelperText error={error}>{helperText}</HelperText>
    </div>
  );
};

export default Radio;
