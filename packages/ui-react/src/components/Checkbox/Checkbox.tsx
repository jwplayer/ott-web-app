import React, { type ReactNode } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import HelperText from '../HelperText/HelperText';

import styles from './Checkbox.module.scss';

type Props = {
  label?: ReactNode;
  name: string;
  value?: string;
  checked?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  lang?: string;
};

const Checkbox: React.FC<Props> = ({ label, name, onChange, header, checked, value, helperText, disabled, error, required, lang, ...rest }: Props) => {
  const { t } = useTranslation('common');
  const id = useOpaqueId('check-box', name);
  const helperTextId = useOpaqueId('helper_text', name);

  return (
    <div className={classNames(styles.checkbox, { [styles.error]: error })} {...rest}>
      {header ? (
        <div className={styles.header}>
          {header}
          {!required ? <span>{t('optional')}</span> : null}
        </div>
      ) : null}
      <div className={styles.row}>
        <input
          name={name}
          type="checkbox"
          id={id}
          value={value}
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          aria-required={required}
          aria-describedby={helperTextId}
        />
        <label htmlFor={id} lang={lang}>
          <span aria-hidden="true">{required ? '* ' : ''}</span>
          {label}
        </label>
      </div>
      <HelperText id={helperTextId} error={error} className={error ? styles.helperTextError : undefined}>
        {helperText}
      </HelperText>
    </div>
  );
};

export default Checkbox;
