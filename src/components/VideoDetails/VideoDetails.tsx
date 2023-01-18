import React from 'react';
import classNames from 'classnames';

import styles from './VideoDetails.module.scss';

import CollapsibleText from '#components/CollapsibleText/CollapsibleText';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Image from '#components/Image/Image';
import type { ImageData } from '#types/playlist';
import { testId } from '#src/utils/common';

type Props = {
  title: string;
  description: string;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  image?: ImageData;
  startWatchingButton: React.ReactNode;
  shareButton: React.ReactNode;
  favoriteButton: React.ReactNode;
  trailerButton: React.ReactNode;
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
}) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  return (
    <div className={styles.video} data-testid={testId('video-details')}>
      <div className={classNames(styles.main, styles.mainPadding)}>
        <Image className={styles.poster} image={image} alt={title} width={1280} />
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
      </div>
    </div>
  );
};

export default VideoDetails;
