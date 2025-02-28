import React, { type PropsWithChildren } from 'react';
import { testId } from '@jwp/ott-common/src/utils/common';

import styles from './MediaInlineLayout.module.scss';

const MediaInlineLayout = ({ player, videoDetails, children }: PropsWithChildren<{ player: React.ReactNode; videoDetails: React.ReactNode }>) => {
  return (
    <div className={styles.videoInlineLayout} data-testid={testId('inline-layout')}>
      <div className={styles.player}>{player}</div>
      <div className={styles.videoDetailsInline}>{videoDetails}</div>
      {children}
    </div>
  );
};

export default MediaInlineLayout;
