import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import useOpaqueId from '../../hooks/useOpaqueId';

import styles from './DateField.module.scss';

type Props = {
  className?: string;
  label?: string;
  placeholder?: string;
  name?: string;
  value: string;
  format?: string;
  onChange?: (dateString: string) => void;
  onFocus?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  helperText?: React.ReactNode;
  error?: boolean;
  required?: boolean;
};

const parseDateString = (dateString: string) => {
  const date = new Date(dateString);

  return isNaN(date.getTime()) ? null : date;
};

const DateField: React.FC<Props> = ({ className, label, error, helperText, value, onChange, format = 'YYYY-MM-DD', ...rest }: Props) => {
  const { t } = useTranslation('common');
  const parsedDate = parseDateString(value);

  const [date, setDate] = useState({
    date: parsedDate?.getDate().toString() || '',
    month: parsedDate ? (parsedDate.getMonth() + 1).toString() : '',
    year: parsedDate?.getFullYear().toString() || '',
  });

  const id = useOpaqueId('text-field', rest.name);

  const DateFieldClassName = classNames(
    styles.dateField,
    {
      [styles.error]: error,
    },
    className,
  );

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/^[0-9]$/.test(event.key) && event.key !== 'Tab' && event.key !== 'Backspace') {
      return event.preventDefault();
    }
  };

  const getNewValue = (value: string, min?: number, max?: number) => {
    const parsed = parseInt(value);
    if (isNaN(parsed)) return '';

    if (min && max) {
      return Math.min(31, Math.max(1, parsed)).toString();
    }

    return parsed.toString();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setDate((current) => {
      const date = name === 'date' ? getNewValue(value, 1, 31) : current.date;
      const month = name === 'month' ? getNewValue(value, 1, 12) : current.month;
      const year = name === 'year' ? getNewValue(value).slice(0, 4) : current.year;

      if (onChange) {
        onChange(date && month && year ? format.replace('YYYY', year).replace('MM', month).replace('DD', date) : '');
      }

      return { date, month, year };
    });

    if ((name === 'month' || name === 'date') && value.length === 2) {
      (event.currentTarget?.nextElementSibling as HTMLInputElement).focus();
    }
  };

  return (
    <div className={DateFieldClassName}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {!rest.required ? <span>{t('optional')}</span> : null}
      </label>
      <div className={styles.container}>
        <input
          className={styles.input}
          name="date"
          placeholder="dd"
          value={date.date}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={2}
          type="number"
          id={id}
        />
        {' / '}
        <input
          className={styles.input}
          name="month"
          placeholder="mm"
          value={date.month}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={2}
          type="number"
          id={id}
        />
        {' / '}
        <input
          className={styles.input}
          name="year"
          placeholder="yyyy"
          value={date.year}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={4}
          type="number"
          id={id}
        />
      </div>
      {helperText ? <div className={styles.helperText}>{helperText}</div> : null}
    </div>
  );
};

export default DateField;
