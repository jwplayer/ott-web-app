import React from 'react';

import type { AccessModel } from '../../../types/Config';
import type { PosterMode, Playlist, PlaylistItem, ImageData } from '../../../types/playlist';
import CardGrid from '../CardGrid/CardGrid';
import Filter from '../Filter/Filter';
import VideoDetails from '../VideoDetails/VideoDetails';
import VideoDetailsInline from '../VideoDetailsInline/VideoDetailsInline';
import VideoList from '../VideoList/VideoList';

import styles from './VideoLayout.module.scss';

type Props = {
  inlineLayout: boolean;
  inlinePlayer?: React.ReactNode;
  cinema: React.ReactNode;
  title: string;
  description: string;
  image?: ImageData;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  posterMode: PosterMode;
  startWatchingButton: React.ReactNode;
  shareButton: React.ReactNode;
  favoriteButton: React.ReactNode;
  trailerButton: React.ReactNode;
  epg?: React.ReactNode;
  isLoading: boolean;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  childrenPadding?: boolean;
  item?: PlaylistItem;
  relatedContentProps?: {
    playlist?: Playlist;
    relatedTitle?: string;
    enableCardTitles?: boolean;
    onRelatedItemClick: (item: PlaylistItem, playlistId?: string) => void;
    watchHistoryDictionary?: { [key: string]: number };
    activeLabel?: string;
    filterMetadata?: React.ReactNode;
    filters?: string[];
    currentFilter?: string;
    defaultFilterLabel?: string;
    filterValuePrefix?: string;
    setFilter?: (value: string) => void;
  };
};

const VideoLayout: React.FC<Props> = ({
  inlineLayout,
  inlinePlayer,
  cinema,
  title,
  description,
  image,
  primaryMetadata,
  secondaryMetadata,
  posterMode,
  startWatchingButton,
  shareButton,
  favoriteButton,
  trailerButton,
  accessModel,
  isLoading,
  isLoggedIn,
  item,
  hasSubscription,
  relatedContentProps,
  childrenPadding,
  epg,
}: Props) => {
  const {
    relatedTitle,
    enableCardTitles,
    onRelatedItemClick,
    setFilter,
    currentFilter = '',
    defaultFilterLabel = '',
    watchHistoryDictionary,
    filterMetadata,
    filterValuePrefix,
    filters,
    activeLabel,
    playlist,
  } = relatedContentProps || {};
  const hasFilters = filters && filters.length > 0;
  const showFilters = hasFilters && setFilter;

  const renderFilters = (forceDropdown: boolean) => (
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
          forceDropdown={forceDropdown}
        />
      )}
    </div>
  );

  if (inlineLayout && inlinePlayer) {
    return (
      <div className={styles.videoInlineLayout}>
        <div className={styles.player}>{inlinePlayer}</div>
        {relatedContentProps && onRelatedItemClick && (
          <div className={styles.relatedVideosList}>
            <VideoList
              className={styles.videoList}
              header={
                <>
                  {relatedTitle && <h3 className={styles.relatedVideosListTitle}>{relatedTitle}</h3>}
                  {hasFilters && renderFilters(true)}
                </>
              }
              activeMediaId={item?.mediaid}
              activeLabel={activeLabel}
              playlist={playlist?.playlist}
              onListItemClick={onRelatedItemClick}
              watchHistory={watchHistoryDictionary}
              isLoading={isLoading}
              accessModel={accessModel}
              isLoggedIn={isLoggedIn}
              hasSubscription={hasSubscription}
            />
          </div>
        )}
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
      </div>
    );
  }

  return (
    <div className={styles.videoCinemaLayout}>
      {cinema}
      <VideoDetails
        title={title}
        description={description}
        primaryMetadata={primaryMetadata}
        image={image}
        posterMode={posterMode}
        shareButton={shareButton}
        startWatchingButton={startWatchingButton}
        secondaryMetadata={secondaryMetadata}
        favoriteButton={favoriteButton}
        trailerButton={trailerButton}
        childrenPadding={childrenPadding}
      >
        {epg}
      </VideoDetails>
      {!!epg && playlist && relatedContentProps && onRelatedItemClick && (
        <div className={styles.relatedVideosGrid}>
          {relatedTitle && <h3 className={styles.relatedVideosGridTitle}>{relatedTitle}</h3>}
          {hasFilters && renderFilters(false)}
          <CardGrid
            playlist={playlist}
            onCardClick={onRelatedItemClick}
            isLoading={isLoading}
            enableCardTitles={enableCardTitles}
            watchHistory={watchHistoryDictionary}
            accessModel={accessModel}
            isLoggedIn={isLoggedIn}
            currentCardItem={item}
            currentCardLabel={activeLabel}
            hasSubscription={hasSubscription}
          />
        </div>
      )}
    </div>
  );
};

export default VideoLayout;
