import React from 'react';

import styles from './VideoLayout.module.scss';

type Props = {
  inlineLayout: boolean;
  videoDetails: React.ReactNode;
  VideoDetailsInline: React.ReactNode;
  inlinePlayer: React.ReactNode;
  cinemaPlayer: React.ReactNode;
  relatedVideosGrid: React.ReactNode;
  relatedVideosList: React.ReactNode;
};

const VideoLayout: React.FC<Props> = ({
  inlineLayout,
  videoDetails,
  VideoDetailsInline,
  inlinePlayer,
  cinemaPlayer,
  relatedVideosList,
  relatedVideosGrid,
}: Props) => {
  if (inlineLayout) {
    return (
      <div className={styles.videoInlineLayout}>
        <div className={styles.player}>{inlinePlayer}</div>
        <div className={styles.relatedVideosList}>{relatedVideosList}</div>
        <div className={styles.videoDetailsInline}>{VideoDetailsInline}</div>
      </div>
    );
  }

  return (
    <div className={styles.videoCinemaLayout}>
      {cinemaPlayer}
      {videoDetails}
      <div className={styles.relatedVideosGrid}>{relatedVideosGrid}</div>
    </div>
  );
};

export default VideoLayout;
