import React, { KeyboardEvent, memo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './VideoListItem.module.scss';

import type { PlaylistItem } from '#types/playlist';
import Image from '#components/Image/Image';
import Lock from '#src/icons/Lock';
import Tag from '#components/Tag/Tag';
import { formatDurationTag, formatLocalizedDateTime, formatSeriesMetaString } from '#src/utils/formatting';
import Today from '#src/icons/Today';
import { isLiveChannel, isSeries } from '#src/utils/media';
import { MediaStatus } from '#src/utils/liveEvent';

type VideoListItemProps = {
  onClick?: () => void;
  onHover?: () => void;
  item: PlaylistItem;
  progress?: number;
  loading?: boolean;
  isActive?: boolean;
  activeLabel?: string;
  isLocked?: boolean;
};

function VideoListItem({ onClick, onHover, progress, activeLabel, item, loading = false, isActive = false, isLocked = true }: VideoListItemProps): JSX.Element {
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

  const renderTagLabel = () => {
    if (loading || !title) return null;

    if (isSeriesItem) {
      return t('series');
    } else if (seasonNumber && episodeNumber) {
      return formatSeriesMetaString(seasonNumber, episodeNumber);
    } else if (duration) {
      return formatDurationTag(duration);
    } else if (isLive) {
      return t('live');
    } else if (isScheduled) {
      return (
        <>
          <Today className={styles.scheduled} />
          {t('scheduled')}
        </>
      );
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && onClick && onClick();

  return (
    <div
      className={styles.listItem}
      onClick={onClick}
      onMouseEnter={onHover}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={t('play_item', { title })}
      tabIndex={0}
    >
      <div className={styles.poster}>
        <Image className={posterImageClassNames} image={image} alt={title} onLoad={() => setImageLoaded(true)} width={320} />
        {isActive && <div className={styles.activeLabel}>{activeLabel}</div>}
        <div className={styles.tags}>
          {isLocked && <Lock className={styles.lock} />}
          <Tag className={classNames(styles.tag, { [styles.live]: isLive })}>{renderTagLabel()}</Tag>
        </div>

        {progress ? (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
      <div className={styles.metadata}>
        {!!scheduledStart && <div className={styles.scheduledStart}>{formatLocalizedDateTime(scheduledStart, language)}</div>}
        <div className={styles.title}>{title}</div>
      </div>
    </div>
  );
}

export default memo(VideoListItem);
