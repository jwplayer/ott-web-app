import React from 'react';

import IconButton from '../IconButton/IconButton';
import SearchIcon from '../../icons/Search';
import CancelIcon from '../../icons/Cancel';

import styles from './SearchBar.module.scss';

export type Props = {
  query?: string;
  onQueryChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearButtonClick?: () => void;
  inputRef?: React.MutableRefObject<HTMLInputElement>;
};

const SearchBar: React.FC<Props> = ({ query, onQueryChange, onClearButtonClick, inputRef }: Props) => {
  return (
    <div className={styles.searchBar}>
      <SearchIcon className={styles.icon} />
      <input
        className={styles.input}
        type="text"
        value={query}
        onChange={onQueryChange}
        aria-label="Search"
        placeholder="Search..."
        ref={inputRef}
      />
      {query ? (
        <IconButton className={styles.clearButton} aria-label="Clear search" onClick={onClearButtonClick}>
          <CancelIcon />
        </IconButton>
      ) : null}
    </div>
  );
};
export default SearchBar;
