import React, { Fragment, FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Filter.module.scss';

import Dropdown from '#components/Dropdown/Dropdown';
import Button from '#components/Button/Button';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';

type Props = {
  name: string;
  value: string;
  valuePrefix?: string;
  defaultLabel: string;
  options: string[];
  forceDropdown?: boolean;
  setValue: (value: string) => void;
};

const Filter: FC<Props> = ({ name, value, defaultLabel, options, setValue, valuePrefix = '', forceDropdown = false }) => {
  const { t } = useTranslation('common');
  const breakpoint: Breakpoint = useBreakpoint();

  if (!options.length) {
    return null;
  }
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => setValue(event.target.value);

  const showFilterRow = !forceDropdown && breakpoint >= Breakpoint.md && options.length < 6;

  return (
    <Fragment>
      {showFilterRow ? (
        <div className={styles.filterRow} role="listbox" aria-label={t('filter_videos_by', { name })}>
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
            aria-label={t('filter_videos_by', { name })}
          />
        </div>
      )}
    </Fragment>
  );
};

export default Filter;
