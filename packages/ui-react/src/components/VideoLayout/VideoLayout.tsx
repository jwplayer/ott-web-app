import React from 'react';
import classNames from 'classnames';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import type { AccessModel } from '@jwp/ott-common/types/config';
import { testId } from '@jwp/ott-common/src/utils/common';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

import CardGrid from '../CardGrid/CardGrid';
import Filter from '../Filter/Filter';
import VideoDetails from '../VideoDetails/VideoDetails';
import VideoDetailsInline from '../VideoDetailsInline/VideoDetailsInline';
import VideoList from '../VideoList/VideoList';

import styles from './VideoLayout.module.scss';

type FilterProps = {
  filterMetadata?: React.ReactNode;
  filters?: (string | { label: string; value: string })[];
  currentFilter?: string;
  defaultFilterLabel?: string;
  setFilter?: (value: string) => void;
};

type LoadMoreProps = {
  hasMore?: boolean;
  loadMore?: () => void;
};

type VideoDetailsProps = {
  title: string;
  description: string;
  image?: string;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  shareButton: React.ReactNode;
  favoriteButton: React.ReactNode;
  trailerButton: React.ReactNode;
  startWatchingButton: React.ReactNode;
  live?: boolean;
};

type VideoListProps = {
  relatedTitle?: string;
  onItemHover?: (item: PlaylistItem) => void;
  watchHistory?: { [key: string]: number };
  activeMediaId?: string;
  activeLabel?: string;
  getURL: (item: PlaylistItem) => string;
};

type Props = {
  inlineLayout: boolean;
  player: React.ReactNode;
  isLoading: boolean;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  children?: React.ReactNode;
  item?: PlaylistItem;
  playlist?: Playlist;
} & FilterProps &
  VideoDetailsProps &
  VideoListProps &
  LoadMoreProps;

const VideoLayout: React.FC<Props> = ({
  inlineLayout,
  player,
  playlist,
  accessModel,
  isLoading,
  isLoggedIn,
  item,
  hasSubscription,
  // video details
  title,
  description,
  image,
  primaryMetadata,
  secondaryMetadata,
  shareButton,
  favoriteButton,
  startWatchingButton,
  trailerButton,
  // list
  relatedTitle,
  watchHistory,
  activeLabel,
  // filters
  filters,
  setFilter,
  filterMetadata,
  currentFilter = '',
  defaultFilterLabel = '',
  children,
  // load more
  hasMore,
  loadMore,
  getURL,
}) => {
  const breakpoint = useBreakpoint();
  const isTablet = breakpoint === Breakpoint.sm || breakpoint === Breakpoint.md;
  // only show the filters when there are two or more filters
  const hasFilters = filters && filters.length > 1;
  const showFilters = hasFilters && setFilter;

  const renderFilters = (forceDropdown: boolean) => (
    <div className={classNames(styles.filters, { [styles.filtersInline]: inlineLayout })}>
      {!!filterMetadata && inlineLayout && <span className={styles.filterMetadata}>{filterMetadata}</span>}
      {showFilters && (
        <Filter name="season" value={currentFilter} defaultLabel={defaultFilterLabel} options={filters} setValue={setFilter} forceDropdown={forceDropdown} />
      )}
    </div>
  );

  const renderRelatedVideos = (grid = true) => {
    if (!playlist) return null;

    return grid ? (
      <>
        <div className={classNames(styles.relatedVideosGrid, { [styles.inlineLayout]: inlineLayout })}>
          <h2 className={styles.relatedVideosGridTitle}>{relatedTitle || '\u00A0'}</h2>
          {hasFilters && renderFilters(inlineLayout)}
        </div>
        <CardGrid
          playlist={playlist}
          isLoading={isLoading}
          watchHistory={watchHistory}
          accessModel={accessModel}
          isLoggedIn={isLoggedIn}
          currentCardItem={item}
          currentCardLabel={activeLabel}
          hasSubscription={hasSubscription}
          hasMore={hasMore}
          loadMore={loadMore}
          getUrl={getURL}
        />
      </>
    ) : (
      <div className={styles.relatedVideosList}>
        <VideoList
          header={
            <div className={styles.relatedVideosListHeader}>
              {title && <h2 className={styles.relatedVideosListTitle}>{relatedTitle}</h2>}
              {hasFilters && renderFilters(true)}
            </div>
          }
          activeMediaId={item?.mediaid}
          activeLabel={activeLabel}
          playlist={playlist}
          watchHistory={watchHistory}
          isLoading={isLoading}
          accessModel={accessModel}
          isLoggedIn={isLoggedIn}
          hasSubscription={hasSubscription}
          hasMore={hasMore}
          loadMore={loadMore}
          getUrl={getURL}
        />
      </div>
    );
  };

  if (inlineLayout) {
    return (
      <div className={styles.videoInlineLayout} data-testid={testId('inline-layout')}>
        <div className={styles.player}>{player}</div>
        <div className={styles.videoDetailsInline}>
          <VideoDetailsInline
            title={secondaryMetadata || title}
            live={item?.duration === 0}
            description={description}
            primaryMetadata={primaryMetadata}
            shareButton={shareButton}
            favoriteButton={favoriteButton}
            trailerButton={trailerButton}
          />
        </div>
        {renderRelatedVideos(isTablet)}
        {children}
      </div>
    );
  }

  return (
    <VideoDetails
      title={title}
      description={description}
      image={image}
      startWatchingButton={startWatchingButton}
      favoriteButton={favoriteButton}
      trailerButton={trailerButton}
      shareButton={shareButton}
      primaryMetadata={primaryMetadata}
      secondaryMetadata={secondaryMetadata}
    >
      {playlist && <section className={styles.relatedVideos}>{renderRelatedVideos(true)}</section>}
      {children}
      {player}
    </VideoDetails>
  );
};

export default VideoLayout;
