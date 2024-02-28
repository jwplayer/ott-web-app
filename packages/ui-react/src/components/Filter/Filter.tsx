import React, { type FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

import Dropdown from '../Dropdown/Dropdown';
import Button from '../Button/Button';

import styles from './Filter.module.scss';

type FilterOption =
  | {
      label: string;
      value: string;
    }
  | string;

type Props = {
  name: string;
  value: string;
  defaultLabel: string;
  options: FilterOption[];
  forceDropdown?: boolean;
  setValue: (value: string) => void;
};

const Filter: FC<Props> = ({ name, value, defaultLabel, options, setValue, forceDropdown = false }) => {
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
          {options.map((option) => {
            const optionLabel = typeof option === 'string' ? option : option.label;
            const optionValue = typeof option === 'string' ? option : option.value;
            const active = value === optionValue;

            return <Button label={optionLabel} onClick={() => setValue(optionValue)} key={optionValue} active={active} role="option" aria-selected={active} />;
          })}
          <Button label={defaultLabel} onClick={() => setValue('')} active={value === ''} key={defaultLabel} role="option" aria-selected={value === ''} />
        </div>
      ) : (
        <div className={styles.filterDropDown}>
          <Dropdown
            className={styles.dropDown}
            size="small"
            options={options}
            defaultLabel={defaultLabel}
            name={name}
            value={value}
            onChange={handleChange}
            aria-label={t('filter_videos_by', { name })}
            hideOptional
          />
        </div>
      )}
    </Fragment>
  );
};

export default Filter;
