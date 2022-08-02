import React from 'react';
import classNames from 'classnames';

import styles from './VideoDetails.module.scss';

import CollapsibleText from '#src/components/CollapsibleText/CollapsibleText';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';

type PosterMode = 'fading' | 'normal';

type Props = {
  title: string;
  description: string;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  poster?: string;
  posterMode: PosterMode;
  startWatchingButton: React.ReactNode;
  shareButton: React.ReactNode;
  favoriteButton: React.ReactNode;
  trailerButton: React.ReactNode;
  childrenPadding?: boolean;
};

const VideoDetails: React.FC<Props> = ({
  title,
  description,
  primaryMetadata,
  secondaryMetadata,
  poster,
  posterMode,
  children,
  startWatchingButton,
  shareButton,
  favoriteButton,
  trailerButton,
  childrenPadding = true,
}) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  return (
    <div className={styles.video} data-testid="video-details">
      <div
        className={classNames(styles.main, styles.mainPadding, {
          [styles.posterNormal]: poster === 'normal',
        })}
      >
        <div className={styles.info}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.metaContainer}>
            <div className={styles.primaryMetadata}>{primaryMetadata}</div>
            {secondaryMetadata && <div className={styles.secondaryMetadata}>{secondaryMetadata}</div>}
          </div>
          <CollapsibleText text={description} className={styles.description} maxHeight={isMobile ? 60 : 'none'} />

          <div className={styles.buttonBar}>
            {startWatchingButton}
            {trailerButton}
            {favoriteButton}
            {shareButton}
          </div>
        </div>
        <div className={classNames(styles.poster, styles[posterMode])} style={{ backgroundImage: `url('${poster}')` }} />
      </div>
      {!!children && <div className={classNames(styles.related, { [styles.mainPadding]: childrenPadding })}>{children}</div>}
    </div>
  );
};

export default VideoDetails;
