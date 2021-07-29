import React from 'react';
import classNames from 'classnames';

import useOpaqueId from '../../hooks/useOpaqueId';

import styles from './Checkbox.module.scss';
import { useTranslation } from 'react-i18next';

type Props = {
  label?: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
};

const Checkbox: React.FC<Props> = ({ label, name, onChange, header, checked, helperText, error, required }: Props) => {
  const { t } = useTranslation('common');
  const id = useOpaqueId('check-box', name);

  return (
    <div className={classNames(styles.checkbox, { [styles.error]: error })}>
      {header ? (
        <div className={styles.header}>
          {header}{!required ? <span>{t('optional')}</span> : null}
        </div>
      ) : null}
      <div className={styles.row}>
        <input name={name} type="checkbox" id={id} onChange={onChange} checked={checked} aria-required={required} />
        <label htmlFor={id}>{label}</label>
      </div>
      {helperText ? <div className={styles.helperText}>{helperText}</div> : null}
    </div>
  );
};

export default Checkbox;
