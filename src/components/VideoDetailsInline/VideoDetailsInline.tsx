import React from 'react';

import styles from './VideoDetailsInline.module.scss';

import CollapsibleText from '#components/CollapsibleText/CollapsibleText';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import { testId } from '#src/utils/common';

type Props = {
  title: string | React.ReactNode;
  description: string;
  primaryMetadata: React.ReactNode;
  shareButton: React.ReactNode;
  favoriteButton: React.ReactNode;
  trailerButton: React.ReactNode;
  live?: boolean;
};

const VideoDetailsInline: React.FC<Props> = ({ title, description, primaryMetadata, shareButton, favoriteButton, trailerButton }) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  const TitleComponent = typeof title === 'string' ? 'h2' : 'div';

  return (
    <div className={styles.details} data-testid={testId('video-details-inline')}>
      <TitleComponent className={styles.title}>{title}</TitleComponent>
      <div className={styles.inlinePlayerMetadata}>
        <div className={styles.primaryMetadata}>{primaryMetadata}</div>
        {trailerButton}
        {favoriteButton}
        {shareButton}
      </div>
      <CollapsibleText text={description} className={styles.description} maxHeight={isMobile ? 60 : 'none'} />
    </div>
  );
};

export default VideoDetailsInline;
