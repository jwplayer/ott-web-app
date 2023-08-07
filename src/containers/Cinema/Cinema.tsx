import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Cinema.module.scss';

import type { PlaylistItem } from '#types/playlist';
import Fade from '#components/Animation/Fade/Fade';
import IconButton from '#components/IconButton/IconButton';
import ArrowLeft from '#src/icons/ArrowLeft';
import PlayerContainer from '#src/containers/PlayerContainer/PlayerContainer';

type Props = {
  open: boolean;
  item: PlaylistItem;
  seriesItem?: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onClose?: () => void;
  onNext?: () => void;
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
  seriesItem,
  title,
  primaryMetadata,
  secondaryMetadata,
  onPlay,
  onPause,
  onComplete,
  onClose,
  onNext,
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

  const handleNext = useCallback(() => {
    onNext && onNext();
  }, [onNext]);

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
  }, [open]);

  return (
    <Fade open={open} className={styles.fade}>
      <div className={styles.cinema}>
        <PlayerContainer
          item={item}
          seriesItem={seriesItem}
          feedId={feedId}
          autostart={true}
          onPlay={handlePlay}
          onPause={handlePause}
          onComplete={handleComplete}
          onUserActive={handleUserActive}
          onUserInActive={handleUserInactive}
          onNext={handleNext}
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
