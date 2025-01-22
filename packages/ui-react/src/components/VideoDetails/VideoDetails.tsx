import React, { type PropsWithChildren } from 'react';
import { testId } from '@jwp/ott-common/src/utils/common';

import Hero from '../Hero/Hero';
import HeroTitle from '../Hero/HeroTitle';
import HeroDescription from '../Hero/HeroDescription';

import styles from './VideoDetails.module.scss';

type Props = PropsWithChildren<{
  title: string;
  description: string;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  image?: string;
  startWatchingButton: React.ReactNode;
  shareButton: React.ReactNode;
  favoriteButton?: React.ReactNode;
  trailerButton?: React.ReactNode;
}>;

const VideoDetails = ({
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
}: Props) => {
  return (
    <div data-testid={testId('cinema-layout')}>
      <header className={styles.videoDetails} data-testid={testId('video-details')} id="video-details">
        <Hero image={image}>
          <HeroTitle title={title} />
          <div className={styles.metaContainer}>
            <div className={styles.primaryMetadata}>{primaryMetadata}</div>
            {secondaryMetadata && <div className={styles.secondaryMetadata}>{secondaryMetadata}</div>}
          </div>
          <HeroDescription className={styles.description} description={description} />
          <div className={styles.buttonBar}>
            {startWatchingButton}
            {trailerButton}
            {favoriteButton}
            {shareButton}
          </div>
        </Hero>
      </header>
      {children}
    </div>
  );
};

export default VideoDetails;
