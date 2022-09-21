import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PlayerContainer from '../PlayerContainer/PlayerContainer';

import styles from './Cinema.module.scss';

import type { PlaylistItem } from '#types/playlist';
import Fade from '#src/components/Animation/Fade/Fade';
import IconButton from '#src/components/IconButton/IconButton';
import ArrowLeft from '#src/icons/ArrowLeft';

type Props = {
  open: boolean;
  item: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onClose?: () => void;
  feedId?: string;
  title: string;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  liveStartDateTime?: string | null;
  liveEndDateTime?: string | null;
  liveFromBeginning?: boolean;
};

const Cinema: React.FC<Props> = ({
  open,
  item,
  title,
  primaryMetadata,
  secondaryMetadata,
  onPlay,
  onPause,
  onComplete,
  onClose,
  feedId,
  liveStartDateTime,
  liveEndDateTime,
  liveFromBeginning,
}: Props) => {
  const { t } = useTranslation();

  // state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userActive, setUserActive] = useState(true);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay && onPlay();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause && onPause();
  }, [onPause]);

  const handleComplete = useCallback(() => {
    onComplete && onComplete();
  }, [onComplete]);

  const handleUserActive = useCallback(() => setUserActive(true), []);
  const handleUserInactive = useCallback(() => setUserActive(false), []);

  // effects
  useEffect(() => {
    if (open) {
      setUserActive(true);
      document.body.style.overflowY = 'hidden';
    }

    return () => {
      document.body.style.overflowY = '';
    };
    // This is needed since we only want this effect to run when the `open` property updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Fade open={open}>
      <div className={styles.cinema}>
        <PlayerContainer
          visible={open}
          item={item}
          feedId={feedId}
          onPlay={handlePlay}
          onPause={handlePause}
          onComplete={handleComplete}
          onUserActive={handleUserActive}
          onUserInActive={handleUserInactive}
          liveEndDateTime={liveEndDateTime}
          liveFromBeginning={liveFromBeginning}
          liveStartDateTime={liveStartDateTime}
        />

        <Fade open={!isPlaying || userActive}>
          <div className={styles.playerOverlay}>
            <div className={styles.playerContent}>
              <IconButton aria-label={t('common:back')} onClick={onClose} className={styles.backButton}>
                <ArrowLeft />
              </IconButton>
              <div>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.metaContainer}>
                  {secondaryMetadata && <div className={styles.secondaryMetadata}>{secondaryMetadata}</div>}
                  <div className={styles.primaryMetadata}>{primaryMetadata}</div>
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </Fade>
  );
};

export default Cinema;
