import React, { memo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { formatDurationTag, formatLocalizedDateTime, formatSeriesMetaString } from '@jwp/ott-common/src/utils/formatting';
import { isLiveChannel, isSeries } from '@jwp/ott-common/src/utils/media';
import { MediaStatus } from '@jwp/ott-common/src/utils/liveEvent';
import Lock from '@jwp/ott-theme/assets/icons/lock.svg?react';
import Today from '@jwp/ott-theme/assets/icons/today.svg?react';

import Image from '../Image/Image';
import Icon from '../Icon/Icon';

import styles from './Card.module.scss';

type CardProps = {
  item: PlaylistItem;
  onHover?: () => void;
  progress?: number;
  posterAspect?: string;
  featured?: boolean;
  disabled?: boolean;
  loading?: boolean;
  isCurrent?: boolean;
  isLocked?: boolean;
  currentLabel?: string;
  url: string;
};

function Card({
  onHover,
  progress,
  item,
  posterAspect = '16:9',
  featured = false,
  disabled = false,
  loading = false,
  isCurrent = false,
  isLocked = true,
  currentLabel,
  url,
}: CardProps): JSX.Element {
  const { title, duration, episodeNumber, seasonNumber, cardImage: image, mediaStatus, scheduledStart } = item;
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'video']);
  // t('play_item')

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

  const isSeriesItem = isSeries(item);
  const isLive = mediaStatus === MediaStatus.LIVE || isLiveChannel(item);
  const isScheduled = mediaStatus === MediaStatus.SCHEDULED;

  const renderTag = () => {
    if (loading || disabled || !title) return null;

    if (isSeriesItem) {
      return <div className={styles.tag}>Series</div>;
    } else if (episodeNumber) {
      return <div className={styles.tag}>{formatSeriesMetaString(seasonNumber, episodeNumber)}</div>;
    } else if (duration) {
      return <div className={styles.tag}>{formatDurationTag(duration)}</div>;
    } else if (isLive) {
      return <div className={classNames(styles.tag, styles.live)}>{t('live')}</div>;
    } else if (isScheduled) {
      return (
        <div className={styles.tag}>
          <Icon icon={Today} className={styles.scheduled} />
          {t('scheduled')}
        </div>
      );
    }
  };

  return (
    <Link
      to={url}
      className={cardClassName}
      onClick={disabled ? (e) => e.preventDefault() : undefined}
      onMouseEnter={onHover}
      tabIndex={disabled ? -1 : 0}
      aria-label={title}
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
                  <Icon icon={Lock} />
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
          {!!scheduledStart && (
            <div className={classNames(styles.scheduledStart, { [styles.loading]: loading })}>{formatLocalizedDateTime(scheduledStart, language)}</div>
          )}
          <div className={classNames(styles.title, { [styles.loading]: loading })}>{title}</div>
        </div>
      )}
    </Link>
  );
}

export default memo(Card);
