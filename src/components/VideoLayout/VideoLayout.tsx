import React from 'react';
import classNames from 'classnames';

import styles from './VideoLayout.module.scss';

import CardGrid from '#components/CardGrid/CardGrid';
import Filter from '#components/Filter/Filter';
import VideoDetails from '#components/VideoDetails/VideoDetails';
import VideoDetailsInline from '#components/VideoDetailsInline/VideoDetailsInline';
import VideoList from '#components/VideoList/VideoList';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import { testId } from '#src/utils/common';
import type { ImageData, Playlist, PlaylistItem } from '#types/playlist';
import type { AccessModel } from '#types/Config';

type FilterProps = {
  filterMetadata?: React.ReactNode;
  filters?: string[];
  currentFilter?: string;
  defaultFilterLabel?: string;
  filterValuePrefix?: string;
  setFilter?: (value: string) => void;
};

type VideoDetailsProps = {
  title: string;
  description: string;
  image?: ImageData;
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
  onItemClick?: (item: PlaylistItem) => void;
  onItemHover?: (item: PlaylistItem) => void;
  watchHistory?: { [key: string]: number };
  activeMediaId?: string;
  activeLabel?: string;
};

type Props = {
  inlineLayout: boolean;
  player: React.ReactNode;
  isLoading: boolean;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  item?: PlaylistItem;
  playlist?: Playlist;
} & FilterProps &
  VideoDetailsProps &
  VideoListProps;

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
  onItemClick,
  relatedTitle,
  watchHistory,
  activeLabel,
  // filters
  filters,
  setFilter,
  filterMetadata,
  filterValuePrefix,
  currentFilter = '',
  defaultFilterLabel = '',
  children,
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
        <Filter
          name="season"
          value={currentFilter}
          valuePrefix={filterValuePrefix}
          defaultLabel={defaultFilterLabel}
          options={filters}
          setValue={setFilter}
          forceDropdown={forceDropdown}
        />
      )}
    </div>
  );

  const renderRelatedVideos = (grid = true) => {
    if (!playlist || !onItemClick) return null;

    return grid ? (
      <>
        <div className={classNames(styles.relatedVideosGrid, { [styles.inlineLayout]: inlineLayout })}>
          <h3 className={styles.relatedVideosGridTitle}>{relatedTitle || '\u00A0'}</h3>
          {hasFilters && renderFilters(inlineLayout)}
        </div>
        <CardGrid
          playlist={playlist}
          onCardClick={onItemClick}
          isLoading={isLoading}
          watchHistory={watchHistory}
          accessModel={accessModel}
          isLoggedIn={isLoggedIn}
          currentCardItem={item}
          currentCardLabel={activeLabel}
          hasSubscription={hasSubscription}
        />
      </>
    ) : (
      <div className={styles.relatedVideosList}>
        <VideoList
          className={styles.videoList}
          header={
            <>
              {title && <h3 className={styles.relatedVideosListTitle}>{relatedTitle}</h3>}
              {hasFilters && renderFilters(true)}
            </>
          }
          activeMediaId={item?.mediaid}
          activeLabel={activeLabel}
          playlist={playlist}
          onListItemClick={onItemClick}
          watchHistory={watchHistory}
          isLoading={isLoading}
          accessModel={accessModel}
          isLoggedIn={isLoggedIn}
          hasSubscription={hasSubscription}
        />
      </div>
    );
  };

  if (inlineLayout) {
    return (
      <div className={styles.videoInlineLayout} data-testid={testId('inline-layout')}>
        <div className={styles.player}>{player}</div>
        {renderRelatedVideos(isTablet)}
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
        {children}
      </div>
    );
  }

  return (
    <div className={styles.videoCinemaLayout} data-testid={testId('cinema-layout')}>
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
      />
      {playlist && onItemClick && <div className={styles.relatedVideos}>{renderRelatedVideos(true)}</div>}
      {children}
      {player}
    </div>
  );
};

export default VideoLayout;
