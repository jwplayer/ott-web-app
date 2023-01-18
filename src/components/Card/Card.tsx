import React, { KeyboardEvent, memo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Card.module.scss';

import { formatDurationTag, formatSeriesMetaString } from '#src/utils/formatting';
import Lock from '#src/icons/Lock';
import Image from '#components/Image/Image';
import type { ImageData } from '#types/playlist';

export const cardAspectRatios = ['2:1', '16:9', '5:3', '4:3', '1:1', '9:13', '2:3', '9:16'] as const;

export type PosterAspectRatio = typeof cardAspectRatios[number];

type CardProps = {
  onClick?: () => void;
  onHover?: () => void;
  title: string;
  duration: number;
  image?: ImageData;
  seriesId?: string;
  seasonNumber?: string;
  episodeNumber?: string;
  progress?: number;
  posterAspect?: PosterAspectRatio;
  featured?: boolean;
  disabled?: boolean;
  loading?: boolean;
  isCurrent?: boolean;
  isLocked?: boolean;
  currentLabel?: string;
};

function Card({
  onClick,
  onHover,
  title,
  duration,
  image,
  seriesId,
  seasonNumber,
  episodeNumber,
  progress,
  posterAspect = '16:9',
  featured = false,
  disabled = false,
  loading = false,
  isCurrent = false,
  isLocked = true,
  currentLabel,
}: CardProps): JSX.Element {
  const { t } = useTranslation('common');
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardClassName = classNames(styles.card, {
    [styles.featured]: featured,
    [styles.disabled]: disabled,
  });
  const posterClassNames = classNames(styles.poster, styles[`aspect${posterAspect.replace(':', '')}`], {
    [styles.current]: isCurrent,
  });
  const posterImageClassNames = classNames(styles.posterImage, {
    [styles.visible]: imageLoaded,
  });

  const renderTag = () => {
    if (loading || disabled || !title) return null;

    if (seriesId) {
      return <div className={styles.tag}>Series</div>;
    } else if (episodeNumber) {
      return <div className={styles.tag}>{formatSeriesMetaString(seasonNumber, episodeNumber)}</div>;
    } else if (duration) {
      return <div className={styles.tag}>{formatDurationTag(duration)}</div>;
    } else if (duration === 0) {
      return <div className={classNames(styles.tag, styles.live)}>{t('live')}</div>;
    }
  };

  return (
    <div
      className={cardClassName}
      onClick={onClick}
      onMouseEnter={onHover}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event: KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && !disabled && onClick && onClick()}
      role="button"
      aria-label={t('play_item', { title })}
    >
      <div className={posterClassNames}>
        <Image className={posterImageClassNames} image={image} width={featured ? 640 : 320} onLoad={() => setImageLoaded(true)} alt={title} />
        {isCurrent && <div className={styles.currentLabel}>{currentLabel}</div>}
        {!loading && (
          <div className={styles.meta}>
            {featured && !disabled && <div className={classNames(styles.title, { [styles.loading]: loading })}>{title}</div>}
            <div className={styles.tags}>
              {isLocked && (
                <div className={classNames(styles.tag, styles.lock)} aria-label={t('card_lock')} role="status">
                  <Lock />
                </div>
              )}
              {renderTag()}
            </div>
          </div>
        )}
        {progress ? (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
      {!featured && !disabled && (
        <div className={styles.titleContainer}>
          <div className={classNames(styles.title, { [styles.loading]: loading })}>{title}</div>
        </div>
      )}
    </div>
  );
}

export default memo(Card);
