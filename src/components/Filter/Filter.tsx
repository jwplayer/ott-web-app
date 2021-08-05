import React, { Fragment, FC } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../Dropdown/Dropdown';
import Button from '../Button/Button';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './Filter.module.scss';

type Props = {
  name: string;
  value: string;
  valuePrefix?: string;
  defaultLabel: string;
  options: string[];
  setValue: (value: string) => void;
};

const Filter: FC<Props> = ({ name, value, defaultLabel, options, setValue, valuePrefix = '' }) => {
  const { t } = useTranslation('common');
  const breakpoint: Breakpoint = useBreakpoint();

  if (!options.length) {
    return null;
  }
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => setValue(event.target.value);

  const showFilterRow = breakpoint >= Breakpoint.md && options.length < 6;

  return (
    <Fragment>
      {showFilterRow ? (
        <div className={styles.filterRow} role="listbox">
          {options.map((option) => (
            <Button label={`${valuePrefix}${option}`} onClick={() => setValue(option)} key={option} active={value === option} role="option" />
          ))}
          <Button label={defaultLabel} onClick={() => setValue('')} active={value === ''} key={defaultLabel} role="option" />
        </div>
      ) : (
        <div className={styles.filterDropDown}>
          <Dropdown
            className={styles.dropDown}
            size="small"
            options={options}
            defaultLabel={defaultLabel}
            valuePrefix={valuePrefix}
            name={name}
            value={value}
            onChange={handleChange}
            aria-label={t('filter_videos_by_genre')}
          />
        </div>
      )}
    </Fragment>
  );
};

export default Filter;
