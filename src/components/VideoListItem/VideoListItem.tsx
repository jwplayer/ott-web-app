import React, { KeyboardEvent, memo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './VideoListItem.module.scss';

import type { ImageData } from '#types/playlist';
import Image from '#components/Image/Image';
import Lock from '#src/icons/Lock';
import Tag from '#components/Tag/Tag';
import { formatDurationTag, formatSeriesMetaString } from '#src/utils/formatting';

type VideoListItemProps = {
  onClick?: () => void;
  onHover?: () => void;
  title: string;
  duration: number;
  image?: ImageData;
  seriesId?: string;
  seasonNumber?: string;
  episodeNumber?: string;
  progress?: number;
  loading?: boolean;
  isActive?: boolean;
  activeLabel?: string;
  isLocked?: boolean;
};

function VideoListItem({
  onClick,
  onHover,
  title,
  duration,
  seriesId,
  seasonNumber,
  episodeNumber,
  progress,
  loading = false,
  isActive = false,
  activeLabel,
  isLocked = true,
  image,
}: VideoListItemProps): JSX.Element {
  const { t } = useTranslation('common');
  const [imageLoaded, setImageLoaded] = useState(false);
  const posterImageClassNames = classNames(styles.posterImage, {
    [styles.visible]: imageLoaded,
  });

  const renderTagLabel = () => {
    if (loading || !title) return null;

    if (seriesId) {
      return t('series');
    } else if (seasonNumber && episodeNumber) {
      return formatSeriesMetaString(seasonNumber, episodeNumber);
    } else if (duration) {
      return formatDurationTag(duration);
    } else if (duration === 0) {
      return t('live');
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
          <Tag className={classNames(styles.tag, { [styles.live]: duration === 0 })}>{renderTagLabel()}</Tag>
        </div>

        {progress ? (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
      <div className={styles.title}>{title}</div>
    </div>
  );
}

export default memo(VideoListItem);
