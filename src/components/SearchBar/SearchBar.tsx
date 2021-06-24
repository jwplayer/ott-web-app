import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('search');

  return (
    <div className={styles.searchBar}>
      <SearchIcon className={styles.icon} />
      <input
        className={styles.input}
        type="text"
        value={query}
        onChange={onQueryChange}
        aria-label={t('search_bar.search_label')}
        placeholder={t('search_bar.search_placeholder')}
        ref={inputRef}
      />
      {query ? (
        <IconButton className={styles.clearButton} aria-label={t('search_bar.clear_search_label')} onClick={onClearButtonClick}>
          <CancelIcon />
        </IconButton>
      ) : null}
    </div>
  );
};
export default SearchBar;
