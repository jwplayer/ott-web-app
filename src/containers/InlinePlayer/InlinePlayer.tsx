import React from 'react';

import PlayerContainer from '../PlayerContainer/PlayerContainer';

import styles from './InlinePlayer.module.scss';

import type { PlaylistItem } from '#types/playlist';

type Props = {
  open: boolean;
  item: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  feedId?: string;
  liveStartDateTime?: string | null;
  liveEndDateTime?: string | null;
  liveFromBeginning?: boolean;
};

const InlinePlayer: React.FC<Props> = ({ open, item, onPlay, onPause, onComplete, feedId, liveStartDateTime, liveEndDateTime, liveFromBeginning }: Props) => {
  return (
    <div className={styles.inlinePlayer}>
      <PlayerContainer
        visible={open}
        item={item}
        feedId={feedId}
        onPlay={onPlay}
        onPause={onPause}
        onComplete={onComplete}
        liveEndDateTime={liveEndDateTime}
        liveFromBeginning={liveFromBeginning}
        liveStartDateTime={liveStartDateTime}
      />
    </div>
  );
};

export default InlinePlayer;
