import React, { useCallback, useState } from 'react';

import styles from './TrailerModal.module.scss';

import type { PlaylistItem } from '#types/playlist';
import Modal from '#components/Modal/Modal';
import Player from '#components/Player/Player';
import ModalCloseButton from '#components/ModalCloseButton/ModalCloseButton';
import Fade from '#components/Animation/Fade/Fade';
import { DEFAULT_PLAYER_ID } from '#src/config';

type Props = {
  item?: PlaylistItem | null;
  title: string;
  open: boolean;
  onClose: () => void;
};

const TrailerModal: React.FC<Props> = ({ item, open, title, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userActive, setUserActive] = useState(true);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleUserActive = useCallback(() => setUserActive(true), []);
  const handleUserInactive = useCallback(() => setUserActive(false), []);

  if (!item) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.container}>
        <Player
          item={item}
          playerId={DEFAULT_PLAYER_ID}
          onPlay={handlePlay}
          onPause={handlePause}
          onComplete={onClose}
          onUserActive={handleUserActive}
          onUserInActive={handleUserInactive}
          autostart
        />
        <Fade open={!isPlaying || userActive}>
          <div className={styles.playerOverlay}>
            <div className={styles.title}>{title}</div>
          </div>
          <ModalCloseButton onClick={onClose} />
        </Fade>
      </div>
    </Modal>
  );
};

export default TrailerModal;
