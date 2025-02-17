import React, { memo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { formatDurationTag, formatLocalizedDateTime, formatSeriesMetaString } from '@jwp/ott-common/src/utils/formatting';
import { isLiveChannel, isSeries } from '@jwp/ott-common/src/utils/media';
import { isLiveEvent, MediaStatus } from '@jwp/ott-common/src/utils/liveEvent';
import Lock from '@jwp/ott-theme/assets/icons/lock.svg?react';
import Today from '@jwp/ott-theme/assets/icons/today.svg?react';
import { testId } from '@jwp/ott-common/src/utils/common';
import type { PosterAspectRatio } from '@jwp/ott-common/src/utils/collection';

import Image from '../Image/Image';
import Icon from '../Icon/Icon';
import createInjectableComponent from '../../modules/createInjectableComponent';

import styles from './Card.module.scss';

export const CardIdentifier = Symbol(`CARD`);

type ReplaceColon<T> = T extends `${infer Left}:${infer Right}` ? `${Left}${Right}` : T;
type PosterAspectRatioClass = ReplaceColon<PosterAspectRatio>;

export type CardProps = {
  item: PlaylistItem;
  onHover?: () => void;
  progress?: number;
  posterAspect?: PosterAspectRatio;
  featured?: boolean;
  disabled?: boolean;
  loading?: boolean;
  isCurrent?: boolean;
  isLocked?: boolean;
  currentLabel?: string;
  url: string;
  headingLevel?: number;
  tabIndex?: number;
  hasSubtitle?: boolean;
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
  headingLevel = 3,
  url,
  tabIndex = 0,
  hasSubtitle = false,
}: CardProps): JSX.Element {
  const { title, duration, episodeNumber, seasonNumber, cardImage: image, mediaStatus, scheduledStart } = item;
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'video']);
  // t('play_item')

  const cardClassName = classNames(styles.card, {
    [styles.featured]: featured,
    [styles.disabled]: disabled,
  });
  const aspectRatioClass = posterAspect ? styles[`aspect${posterAspect.replace(':', '') as PosterAspectRatioClass}`] : undefined;
  const posterClassNames = classNames(styles.poster, aspectRatioClass, {
    [styles.current]: isCurrent,
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
      return <div className={styles.tag}>{formatDurationTag(duration, { minutesAbbreviation: t('common:abbreviation.minutes') })}</div>;
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

  const renderHeading = () => {
    const heading = React.createElement(`h${headingLevel}`, { className: styles.title }, title);
    const itemSubtitle = typeof item.subtitle === 'string' ? item.subtitle : null;
    const subtitle = !!scheduledStart && isLiveEvent(item) ? formatLocalizedDateTime(scheduledStart, language) : itemSubtitle;

    if (loading) {
      return <div className={classNames(styles.titleContainer, styles.loading)} />;
    }

    return (
      <div className={classNames(styles.titleContainer, { [styles.hasSubtitle]: hasSubtitle })}>
        {heading}
        {subtitle && <p className={classNames(styles.subtitle)}>{subtitle}</p>}
      </div>
    );
  };
  return (
    <Link
      role="button"
      to={url}
      className={cardClassName}
      onClick={disabled ? (e) => e.preventDefault() : undefined}
      onMouseEnter={onHover}
      tabIndex={disabled ? -1 : tabIndex}
      data-testid={testId(title)}
    >
      {!featured && renderHeading()}
      <div className={posterClassNames}>
        <Image className={styles.posterImage} image={image} width={featured ? 640 : 320} alt="" />
        {!loading && (
          <div className={classNames(styles.meta, { [styles.featured]: featured })}>
            {featured && renderHeading()}
            <div className={styles.tags}>
              {isLocked && (
                <div className={classNames(styles.tag, styles.lock)} aria-label={t('card_lock')} role="img">
                  <Icon icon={Lock} />
                </div>
              )}
              {renderTag()}
            </div>
          </div>
        )}
        {isCurrent && <div className={styles.currentLabel}>{currentLabel}</div>}
        {progress ? (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export default memo(createInjectableComponent(CardIdentifier, Card));
