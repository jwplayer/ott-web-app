import React, { memo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { formatDurationTag, formatLocalizedDateTime, formatSeriesMetaString } from '@jwp/ott-common/src/utils/formatting';
import { isLiveChannel, isSeries } from '@jwp/ott-common/src/utils/media';
import { MediaStatus } from '@jwp/ott-common/src/utils/liveEvent';
import { testId } from '@jwp/ott-common/src/utils/common';
import Lock from '@jwp/ott-theme/assets/icons/lock.svg?react';
import Today from '@jwp/ott-theme/assets/icons/today.svg?react';

import Image from '../Image/Image';
import Icon from '../Icon/Icon';

import styles from './VideoListItem.module.scss';

type VideoListItemProps = {
  onHover?: () => void;
  item: PlaylistItem;
  progress?: number;
  loading?: boolean;
  isActive?: boolean;
  activeLabel?: string;
  isLocked?: boolean;
  url: string;
};

function VideoListItem({ onHover, progress, activeLabel, item, url, loading = false, isActive = false, isLocked = true }: VideoListItemProps): JSX.Element {
  const { title, duration, seasonNumber, episodeNumber, cardImage: image, mediaStatus, scheduledStart } = item;

  const {
    t,
    i18n: { language },
  } = useTranslation('common');
  const [imageLoaded, setImageLoaded] = useState(false);
  const posterImageClassNames = classNames(styles.posterImage, {
    [styles.visible]: imageLoaded,
  });

  const isSeriesItem = isSeries(item);
  const isLive = mediaStatus === MediaStatus.LIVE || isLiveChannel(item);
  const isScheduled = mediaStatus === MediaStatus.SCHEDULED;

  const renderTag = () => {
    if (loading || !title) return null;

    if (isSeriesItem) {
      return <div className={styles.tag}>{t('video:series')}</div>;
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
    <Link role="button" to={url} className={styles.listItem} onMouseEnter={onHover} tabIndex={0} data-testid={testId(title)}>
      <div className={styles.titleContainer}>
        <h3 className={styles.title}>{title}</h3>
        {!!scheduledStart && <div className={styles.scheduledStart}>{formatLocalizedDateTime(scheduledStart, language)}</div>}
      </div>
      <div className={styles.poster}>
        <Image className={posterImageClassNames} image={image} onLoad={() => setImageLoaded(true)} width={320} alt="" />
        <div className={styles.tags}>
          {isLocked && (
            <div className={classNames(styles.tag, styles.lock)} aria-label={t('card_lock')}>
              <Icon icon={Lock} />
            </div>
          )}
          {renderTag()}
        </div>
        {isActive && <div className={styles.activeLabel}>{activeLabel}</div>}
        {progress ? (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export default memo(VideoListItem);
