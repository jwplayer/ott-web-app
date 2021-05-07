import React, { useState, Fragment, FC } from 'react';

import Dropdown from '../Dropdown/Dropdown';
import FilterModal from '../FilterModal/FilterModal';
import Button from '../Button/Button';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './Filter.module.scss';

type Props = {
  name: string;
  value: string;
  defaultLabel: string;
  options: string[];
  setValue: (value: string) => void;
};

const Filter: FC<Props> = ({ name, value, defaultLabel, options, setValue }) => {
  const [isFilterModalOpen, openFilterModal] = useState(false);
  const breakpoint: Breakpoint = useBreakpoint();

  if (!options.length) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => setValue(event.target.value);

  const handleOnClick = () => {
    if (breakpoint < Breakpoint.md) {
      openFilterModal(true);
    }
  };

  const filterButtons = () => {
    const extraOptions = options.map((option) => (
      <Button label={option} onClick={() => setValue(option)} key={option} active={value === option} />
    ));

    return [
      <Button label={defaultLabel} onClick={() => setValue('')} active={value === ''} key={defaultLabel} />,
      ...extraOptions,
    ];
  };

  const showFilterRow = breakpoint >= 2 && options.length < 6;

  return (
    <Fragment>
      <FilterModal name={name} isOpen={isFilterModalOpen} onClose={() => openFilterModal(false)}>
        {filterButtons()}
      </FilterModal>
      {showFilterRow ? (
        <div className={styles.filterRow}>{filterButtons()}</div>
      ) : (
        <Dropdown
          options={options}
          defaultLabel={defaultLabel}
          name={name}
          value={value}
          onClick={handleOnClick}
          onChange={handleChange}
          optionsStyle={styles.optionMobile}
        />
      )}
    </Fragment>
  );
};

export default Filter;
