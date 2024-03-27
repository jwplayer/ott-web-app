import React from 'react';
import classNames from 'classnames';
import { testId } from '@jwp/ott-common/src/utils/common';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

import CollapsibleText from '../CollapsibleText/CollapsibleText';
import Image from '../Image/Image';

import styles from './VideoDetails.module.scss';

type Props = {
  title: string;
  description: string;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  image?: string;
  startWatchingButton: React.ReactNode;
  shareButton: React.ReactNode;
  favoriteButton?: React.ReactNode;
  trailerButton?: React.ReactNode;
  children: React.ReactNode;
};

const VideoDetails: React.VFC<Props> = ({
  title,
  description,
  primaryMetadata,
  secondaryMetadata,
  image,
  startWatchingButton,
  shareButton,
  favoriteButton,
  trailerButton,
  children,
}) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;
  const alt = ''; // intentionally empty for a11y, because adjacent text alternative

  return (
    <div data-testid={testId('cinema-layout')}>
      <header className={styles.video} data-testid={testId('video-details')} id="video-details">
        <div className={classNames(styles.main, styles.mainPadding)}>
          <Image className={styles.poster} image={image} alt={alt} width={1280} />
          <div className={styles.posterFade} />
          <div className={styles.info}>
            <h1 className={styles.title}>{title}</h1>
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
        </div>
      </header>
      {children}
    </div>
  );
};

export default VideoDetails;
