import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './DateField.module.scss';

import HelperText from '#components/HelperText/HelperText';
import useOpaqueId from '#src/hooks/useOpaqueId';

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

  const [values, setValues] = useState({
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
    if (event.key === 'Backspace' && values[event.currentTarget.name as 'date' | 'month' | 'year'] === '') {
      (event.currentTarget.previousElementSibling as HTMLElement)?.focus();

      return event.preventDefault();
    }

    if (!/^[0-9]$/.test(event.key) && event.key !== 'Tab' && event.key !== 'Backspace') {
      return event.preventDefault();
    }
  };

  const padLeft = (value: number) => {
    return value > 0 && value < 10 ? `0${value}` : value.toString();
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const parseBlurValue = (value: string, min: number, max: number) => {
    const parsed = clamp(parseInt(value), min, max);
    if (isNaN(parsed)) return '';

    return value.length > 0 && parsed < 10 ? padLeft(parsed) : parsed.toString();
  };

  const parseInputValue = (value: string, min: number, max: number) => {
    const parsed = clamp(parseInt(value), min, max);
    if (isNaN(parsed)) return '';

    return value.length > 1 && parsed < 10 ? padLeft(parsed) : parsed.toString();
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setValues((current) => {
      const date = name === 'date' ? parseBlurValue(value, 1, 31) : current.date;
      const month = name === 'month' ? parseBlurValue(value, 1, 12) : current.month;
      const year = name === 'year' ? parseBlurValue(value, 1900, 2100) : current.year;

      return { date, month, year };
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const nextSibling = event.currentTarget?.nextElementSibling as HTMLInputElement;

    const date = name === 'date' ? parseInputValue(value, 0, 31) : values.date;
    const month = name === 'month' ? parseInputValue(value, 0, 12) : values.month;
    const year = name === 'year' ? parseInputValue(value, 0, 2100).slice(0, 4) : values.year;

    setValues({ date, month, year });

    if (onChange) {
      onChange(date && month && year ? format.replace('YYYY', year).replace('MM', month).replace('DD', date) : '');
    }

    if ((nextSibling && name === 'month' && month.length === 2) || (name === 'date' && date.length === 2)) {
      setTimeout(() => nextSibling.focus(), 1);
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
          value={values.date}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
          value={values.month}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
          value={values.year}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={4}
          type="number"
          id={id}
        />
      </div>
      <HelperText error={error}>{helperText}</HelperText>
    </div>
  );
};

export default DateField;
