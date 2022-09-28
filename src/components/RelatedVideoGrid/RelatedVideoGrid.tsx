import React from 'react';

import CardGrid from '../CardGrid/CardGrid';
import Filter from '../Filter/Filter';

import styles from './RelatedVideoGrid.module.scss';

import type { PlaylistItem, Playlist } from '#types/playlist';
import type { AccessModel } from '#types/Config';

type Props = {
  playlist?: Playlist;
  onCardHover?: (item: PlaylistItem) => void;
  onCardClick: (item: PlaylistItem, playlistId?: string) => void;
  watchHistory?: { [key: string]: number };
  isLoading: boolean;
  accessModel: AccessModel;
  enableCardTitles?: boolean;
  activeLabel?: string;
  currentCardItem?: PlaylistItem;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  title?: React.ReactNode;
  filters?: string[];
  currentFilter?: string;
  defaultFilterLabel?: string;
  filterValuePrefix?: string;
  setFilter?: (value: string) => void;
};

const RelatedVideoGrid = ({
  playlist,
  onCardClick,
  onCardHover,
  isLoading,
  enableCardTitles,
  accessModel,
  isLoggedIn,
  hasSubscription,
  setFilter,
  currentFilter = '',
  defaultFilterLabel = '',
  filterValuePrefix,
  title,
  filters,
  currentCardItem,
  activeLabel,
}: Props) => {
  if (!playlist) {
    return null;
  }

  const hasFilters = filters && filters.length > 0;
  const showFilters = hasFilters && setFilter;

  return (
    <>
      <div className={styles.related}>
        <h3>{title}</h3>
        {showFilters && (
          <Filter
            name="categories"
            value={currentFilter}
            valuePrefix={filterValuePrefix}
            defaultLabel={defaultFilterLabel}
            options={filters}
            setValue={setFilter}
          />
        )}
      </div>
      <CardGrid
        playlist={playlist}
        onCardClick={onCardClick}
        onCardHover={onCardHover}
        isLoading={isLoading}
        enableCardTitles={enableCardTitles}
        accessModel={accessModel}
        isLoggedIn={isLoggedIn}
        currentCardItem={currentCardItem}
        currentCardLabel={activeLabel}
        hasSubscription={hasSubscription}
      />
    </>
  );
};

export default RelatedVideoGrid;
