import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import ArrowLeft from '@jwp/ott-theme/assets/icons/arrow_left.svg?react';

import IconButton from '../../components/IconButton/IconButton';
import PlayerContainer from '../PlayerContainer/PlayerContainer';
import Fade from '../../components/Animation/Fade/Fade';
import Icon from '../../components/Icon/Icon';
import Modal from '../../components/Modal/Modal';

import styles from './Cinema.module.scss';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [overlayHasFocus, setOverlayHasFocus] = useState(false);
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
    if (open) setUserActive(true);
  }, [open]);

  return (
    <Modal open={open} animationContainerClassName={styles.cinemaContainer} onClose={onClose}>
      <div className={styles.cinema} aria-modal="true" role="dialog" aria-label={t('videoplayer')}>
        <Fade className={styles.overlayFade} open={!isPlaying || userActive || overlayHasFocus} keepMounted>
          <div className={styles.playerOverlay} onFocus={() => setOverlayHasFocus(true)} onBlur={() => setOverlayHasFocus(false)}>
            <div className={styles.playerContent}>
              <IconButton aria-label={t('common:back')} onClick={onClose} className={styles.backButton}>
                <Icon icon={ArrowLeft} />
              </IconButton>
              <div>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.metaContainer}>
                  {secondaryMetadata && <div className={styles.secondaryMetadata}>{secondaryMetadata}</div>}
                  <div className={styles.primaryMetadata}>{primaryMetadata}</div>
                </div>
              </div>
            </div>
          </div>
        </Fade>
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
      </div>
    </Modal>
  );
};

export default Cinema;
