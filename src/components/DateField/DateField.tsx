import React from 'react';
import classNames from 'classnames';

import useOpaqueId from '../../hooks/useOpaqueId';

import styles from './DateField.module.scss';

type Props = {
  className?: string;
  label?: string;
  placeholder?: string;
  name?: string;
  value: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  helperText?: React.ReactNode;
  error?: boolean;
};

const DateField: React.FC<Props> = ({
  className,
  label,
  error,
  helperText,

  ...rest
}: Props) => {
  const id = useOpaqueId('text-field', rest.name);

  const DateFieldClassName = classNames(
    styles.dateField,
    {
      [styles.error]: error,
    },
    className,
  );

  const formatDate = (event: React.KeyboardEvent) => {
    const format: string = 'mm/dd/yyyy';
    if (!event.ctrlKey && !event.metaKey && (event.keyCode == 32 || event.keyCode > 46)) {
      const target: Partial<HTMLTextAreaElement> = event.target;

      const match = new RegExp(
        format
          .replace(/(\w+)\W(\w+)\W(\w+)/, '^\\s*($1)\\W*($2)?\\W*($3)?([0-9]*).*')
          .replace(/mm|dd/g, '\\d{2}')
          .replace(/yy/g, '\\d{4}'),
      );
      const replacer = format.match(/\W/) as unknown as string;
      if (!target.value) return;

      const replace = '$1/$2/$3$4'.replace(/\//g, replacer);
      target.value = target.value
        .replace(/(^|\W)(?=\d\W)/g, '$10') // padding
        .replace(match, replace) // fields
        .replace(/(\W)+/g, '$1'); // remove repeats}
    }
  };

  return (
    <div className={DateFieldClassName}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.container}>
        <input className={styles.input} onKeyUp={formatDate} maxLength={10} type="text" id={id} {...rest} />
      </div>
      {helperText ? <div className={styles.helperText}>{helperText}</div> : null}
    </div>
  );
};

export default DateField;
