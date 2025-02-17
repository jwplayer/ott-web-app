import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { CYCLE_MODE_RESTART, type RenderControl, type RenderPagination, TileSlider } from '@videodock/tile-slider';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import type { AccessModel, AppContentType } from '@jwp/ott-common/types/config';
import { isLocked } from '@jwp/ott-common/src/utils/entitlements';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { PersonalShelf } from '@jwp/ott-common/src/constants';
import ChevronLeft from '@jwp/ott-theme/assets/icons/chevron_left.svg?react';
import ChevronRight from '@jwp/ott-theme/assets/icons/chevron_right.svg?react';
import useBreakpoint, { Breakpoint, type Breakpoints } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import type { PosterAspectRatio } from '@jwp/ott-common/src/utils/collection';
import { hasSupplementaryCardInfo } from '@jwp/ott-common/src/utils/media';

import '@videodock/tile-slider/lib/style.css';

import Card from '../Card/Card';
import Icon from '../Icon/Icon';
import createInjectableComponent from '../../modules/createInjectableComponent';

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

export const ShelfIdentifier = Symbol(`SHELF`);

export type ShelfProps = {
  playlist: Playlist;
  type: AppContentType;
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
  const tilesToShow: number = (featured ? featuredTileBreakpoints[breakpoint] : tileBreakpoints[breakpoint]) + visibleTilesDelta;
  const showSubtitles = playlist.playlist.some(hasSupplementaryCardInfo);

  const renderTile = useCallback(
    ({ item, isVisible }: { item: PlaylistItem; isVisible: boolean }) => {
      const { mediaid: id, title } = item;
      const url = mediaURL({ id, title, playlistId: playlist.feedid, play: type === PersonalShelf.ContinueWatching });

      return (
        <Card
          key={item.mediaid}
          progress={watchHistory ? watchHistory[item.mediaid] : undefined}
          onHover={typeof onCardHover === 'function' ? () => onCardHover(item) : undefined}
          featured={featured}
          disabled={!isVisible}
          loading={loading}
          isLocked={isLocked(accessModel, isLoggedIn, hasSubscription, item)}
          posterAspect={posterAspect}
          item={item}
          url={url}
          hasSubtitle={showSubtitles}
        />
      );
    },
    [watchHistory, onCardHover, featured, loading, accessModel, isLoggedIn, hasSubscription, posterAspect, playlist.feedid, type, showSubtitles],
  );

  const renderRightControl: RenderControl = useCallback(
    ({ onClick }) => (
      <button className={styles.chevron} aria-label={t('slide_next')} onClick={onClick}>
        <Icon icon={ChevronRight} />
      </button>
    ),
    [t],
  );

  const renderLeftControl: RenderControl = useCallback(
    ({ onClick }) => (
      <button className={styles.chevron} aria-label={t('slide_previous')} onClick={onClick}>
        <Icon icon={ChevronLeft} />
      </button>
    ),
    [t],
  );

  const renderPagination: RenderPagination = ({ page, pages }) => {
    const items = Array.from({ length: pages }, (_, pageIndex) => pageIndex);

    return (
      <>
        <div aria-live="polite" className="hidden">
          {t('slide_indicator', { page: page + 1, pages })}
        </div>
        {featured && (
          <div aria-hidden="true" className={styles.dots}>
            {items.map((current) => (
              <span key={current} className={classNames(styles.dot, { [styles.active]: page === current })} />
            ))}
          </div>
        )}
      </>
    );
  };

  if (error || !playlist?.playlist) return <h2 className={styles.error}>Could not load items</h2>;

  return (
    <div className={classNames(styles.shelf)}>
      {featured ? null : loading ? <div className={styles.loadingTitle} /> : <h2 className={classNames(styles.title)}>{title || playlist.title}</h2>}
      <TileSlider<PlaylistItem>
        className={styles.slider}
        items={playlist.playlist}
        tilesToShow={tilesToShow}
        cycleMode={CYCLE_MODE_RESTART}
        showControls={!loading}
        spacing={16}
        renderLeftControl={renderLeftControl}
        renderRightControl={renderRightControl}
        renderPagination={renderPagination}
        renderTile={renderTile}
      />
    </div>
  );
};

export default createInjectableComponent(ShelfIdentifier, Shelf);
