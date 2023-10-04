import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Checkbox.module.scss';

import HelperText from '#components/HelperText/HelperText';
import useOpaqueId from '#src/hooks/useOpaqueId';

type Props = {
  label?: string | JSX.Element;
  name: string;
  value?: string;
  checked?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
};

const Checkbox: React.FC<Props> = ({ label, name, onChange, header, checked, value, helperText, disabled, error, required }: Props) => {
  const { t } = useTranslation('common');
  const id = useOpaqueId('check-box', name);

  return (
    <div className={classNames(styles.checkbox, { [styles.error]: error })}>
      {header ? (
        <div className={styles.header}>
          {header}
          {!required ? <span>{t('optional')}</span> : null}
        </div>
      ) : null}
      <div className={styles.row}>
        <input name={name} type="checkbox" id={id} value={value} onChange={onChange} checked={checked} aria-required={required} disabled={disabled} />
        <label htmlFor={id}>
          {required ? '* ' : ''}
          {label}
        </label>
      </div>
      <HelperText error={error} className={error ? styles.helperTextError : undefined}>
        {helperText}
      </HelperText>
    </div>
  );
};

export default Checkbox;
