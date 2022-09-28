import React from 'react';

import VideoList from '../VideoList/VideoList';
import Filter from '../Filter/Filter';

import styles from './RelatedVideoList.module.scss';

import type { AccessModel } from '#types/Config';
import type { PlaylistItem } from '#types/playlist';

type Props = {
  playlist?: PlaylistItem[];
  title?: string;
  onListItemHover?: (item: PlaylistItem) => void;
  onListItemClick: (item: PlaylistItem, playlistId?: string) => void;
  watchHistory?: { [key: string]: number };
  isLoading: boolean;
  activeMediaId?: string;
  activeLabel?: string;
  filterMetadata?: React.ReactNode;
  filters?: string[];
  currentFilter?: string;
  defaultFilterLabel?: string;
  filterValuePrefix?: string;
  setFilter?: (value: string) => void;
  isActive?: boolean;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
};

function RelatedVideoList({
  playlist,
  title,
  onListItemClick,
  onListItemHover,
  isLoading = false,
  watchHistory,
  activeMediaId,
  activeLabel,
  filters,
  setFilter,
  currentFilter = '',
  defaultFilterLabel = '',
  filterValuePrefix,
  filterMetadata,
  hasSubscription,
  isLoggedIn,
  accessModel,
}: Props) {
  const hasFilters = filters && filters.length > 0;
  const showFilters = hasFilters && setFilter;

  const renderFilters = () => (
    <div className={styles.filters}>
      {!!filterMetadata && <span className={styles.filterMetadata}>{filterMetadata}</span>}
      {showFilters && (
        <Filter
          name="categories"
          value={currentFilter}
          valuePrefix={filterValuePrefix}
          defaultLabel={defaultFilterLabel}
          options={filters}
          setValue={setFilter}
          dropDown
        />
      )}
    </div>
  );

  return (
    <VideoList
      className={styles.videoList}
      header={
        <>
          {title && <h3 className={styles.title}>{title}</h3>}
          {hasFilters && renderFilters()}
        </>
      }
      activeMediaId={activeMediaId}
      activeLabel={activeLabel}
      playlist={playlist}
      onListItemClick={onListItemClick}
      onListItemHover={onListItemHover}
      watchHistory={watchHistory}
      isLoading={isLoading}
      accessModel={accessModel}
      isLoggedIn={isLoggedIn}
      hasSubscription={hasSubscription}
    />
  );
}

export default RelatedVideoList;
