import React from 'react';
import { useTranslation } from 'react-i18next';
import Search from '@jwp/ott-theme/assets/icons/search.svg?react';
import Cancel from '@jwp/ott-theme/assets/icons/cancel.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';

import styles from './SearchBar.module.scss';

export type Props = {
  query?: string;
  onQueryChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearButtonClick?: () => void;
  onClose?: () => void;
  inputRef?: React.MutableRefObject<HTMLInputElement>;
};

const SearchBar: React.FC<Props> = ({ query, onQueryChange, onClearButtonClick, onClose, inputRef }: Props) => {
  const { t } = useTranslation('search');
  const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    inputRef?.current.focus(); // Force hide mobile keyboard
    (document.querySelector('#content') as HTMLElement)?.focus();
  };

  return (
    <div className={styles.searchBar}>
      <Icon icon={Search} className={styles.icon} />
      <form className={styles.searchForm} role="search" onSubmit={handleSubmit}>
        <label htmlFor="searchbar-input" className="hidden">
          {t('search_bar.search_label')}
        </label>
        <input
          className={styles.input}
          id="searchbar-input"
          type="search"
          value={query}
          onChange={onQueryChange}
          onKeyDown={(event) => event.key === 'Escape' && onClose?.()}
          placeholder={t('search_bar.search_placeholder')}
          ref={inputRef}
        />
        {query ? (
          <IconButton className={styles.clearButton} aria-label={t('search_bar.clear_search_label')} onClick={onClearButtonClick}>
            <Icon icon={Cancel} />
          </IconButton>
        ) : null}
      </form>
    </div>
  );
};
export default SearchBar;
