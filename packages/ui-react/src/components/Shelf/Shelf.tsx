import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import type { AccessModel, ContentType } from '@jwp/ott-common/types/config';
import { isLocked } from '@jwp/ott-common/src/utils/entitlements';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { PersonalShelf } from '@jwp/ott-common/src/constants';
import ChevronLeft from '@jwp/ott-theme/assets/icons/chevron_left.svg?react';
import ChevronRight from '@jwp/ott-theme/assets/icons/chevron_right.svg?react';
import useBreakpoint, { Breakpoint, type Breakpoints } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import type { PosterAspectRatio } from '@jwp/ott-common/src/utils/collection';

import TileDock from '../TileDock/TileDock';
import Card from '../Card/Card';
import Icon from '../Icon/Icon';

import styles from './Shelf.module.scss';

export const tileBreakpoints: Breakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 3,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

export const featuredTileBreakpoints: Breakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 1,
  [Breakpoint.md]: 1,
  [Breakpoint.lg]: 1,
  [Breakpoint.xl]: 1,
};

export type ShelfProps = {
  playlist: Playlist;
  type: ContentType;
  onCardHover?: (playlistItem: PlaylistItem) => void;
  watchHistory?: { [key: string]: number };
  enableTitle?: boolean;
  enableCardTitles?: boolean;
  featured?: boolean;
  loading?: boolean;
  error?: unknown;
  title?: string;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  posterAspect?: PosterAspectRatio;
  visibleTilesDelta?: number;
};

const Shelf = ({
  playlist,
  type,
  onCardHover,
  title,
  watchHistory,
  featured = false,
  loading = false,
  error = null,
  accessModel,
  isLoggedIn,
  hasSubscription,
  posterAspect,
  visibleTilesDelta = 0,
}: ShelfProps) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const { t } = useTranslation('common');
  const [didSlideBefore, setDidSlideBefore] = useState(false);
  const tilesToShow: number = (featured ? featuredTileBreakpoints[breakpoint] : tileBreakpoints[breakpoint]) + visibleTilesDelta;

  const renderTile = useCallback(
    (item: PlaylistItem, isInView: boolean) => {
      const url = mediaURL({ media: item, playlistId: playlist.feedid, play: type === PersonalShelf.ContinueWatching });

      return (
        <Card
          key={item.mediaid}
          progress={watchHistory ? watchHistory[item.mediaid] : undefined}
          onHover={typeof onCardHover === 'function' ? () => onCardHover(item) : undefined}
          featured={featured}
          disabled={!isInView}
          loading={loading}
          isLocked={isLocked(accessModel, isLoggedIn, hasSubscription, item)}
          posterAspect={posterAspect}
          item={item}
          url={url}
        />
      );
    },
    [watchHistory, onCardHover, featured, loading, accessModel, isLoggedIn, hasSubscription, posterAspect, playlist.feedid, type],
  );

  const renderRightControl = useCallback(
    (doSlide: () => void) => (
      <div
        className={styles.chevron}
        role="button"
        tabIndex={0}
        aria-label={t('slide_next')}
        onKeyDown={(event: React.KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && handleSlide(doSlide)}
        onClick={() => handleSlide(doSlide)}
      >
        <Icon icon={ChevronRight} />
      </div>
    ),
    [t],
  );

  const renderLeftControl = useCallback(
    (doSlide: () => void) => (
      <div
        className={classNames(styles.chevron, {
          [styles.disabled]: !didSlideBefore,
        })}
        role="button"
        tabIndex={didSlideBefore ? 0 : -1}
        aria-label={t('slide_previous')}
        onKeyDown={(event: React.KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && handleSlide(doSlide)}
        onClick={() => handleSlide(doSlide)}
      >
        <Icon icon={ChevronLeft} />
      </div>
    ),
    [didSlideBefore, t],
  );

  const renderPaginationDots = (index: number, pageIndex: number) => (
    <span key={pageIndex} className={classNames(styles.dot, { [styles.active]: index === pageIndex })} />
  );

  const renderPageIndicator = (pageIndex: number, pages: number) => (
    <div aria-live="polite" className="hidden">
      {t('slide_indicator', { page: pageIndex + 1, pages })}
    </div>
  );

  const handleSlide = (doSlide: () => void): void => {
    setDidSlideBefore(true);
    doSlide();
  };

  if (error || !playlist?.playlist) return <h2 className={styles.error}>Could not load items</h2>;

  return (
    <div className={classNames(styles.shelf)}>
      {!featured ? <h2 className={classNames(styles.title)}>{title || playlist.title}</h2> : null}
      <TileDock<PlaylistItem>
        items={playlist.playlist}
        tilesToShow={tilesToShow}
        wrapWithEmptyTiles={featured && playlist.playlist.length === 1}
        cycleMode={'restart'}
        showControls={!loading}
        showDots={featured}
        transitionTime={'0.3s'}
        spacing={8}
        renderLeftControl={renderLeftControl}
        renderRightControl={renderRightControl}
        renderPaginationDots={renderPaginationDots}
        renderPageIndicator={renderPageIndicator}
        renderTile={renderTile}
      />
    </div>
  );
};

export default Shelf;
