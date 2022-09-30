import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import PlayerContainer from '../PlayerContainer/PlayerContainer';

import styles from './InlinePlayer.module.scss';

import Image from '#src/components/Image/Image';
import type { PlaylistItem } from '#types/playlist';
import Fade from '#src/components/Animation/Fade/Fade';
import Lock from '#src/icons/Lock';
import Button from '#src/components/Button/Button';
import { addQueryParam } from '#src/utils/location';
import { useConfigStore } from '#src/stores/ConfigStore';

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
  startWatchingButton: React.ReactNode;
  isLogged: boolean;
  isLocked: boolean;
};

const InlinePlayer: React.FC<Props> = ({
  open,
  item,
  onPlay,
  onPause,
  onComplete,
  feedId,
  liveStartDateTime,
  liveEndDateTime,
  liveFromBeginning,
  startWatchingButton,
  isLogged,
  isLocked,
}: Props) => {
  const siteName = useConfigStore((s) => s.config.siteName);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const loginButtonClickHandler = () => {
    navigate(addQueryParam(location, 'u', 'login'));
  };

  return (
    <div className={styles.inlinePlayer}>
      <Fade open={isLocked}>
        <div className={styles.lockedOverlay}>
          <Image className={styles.poster} image={item.shelfImage} alt={item.title} width={1280} />
          <Lock className={styles.lock} />
          <h2 className={styles.callToAction}>{t('video:sign_up_to_start_watching')}</h2>
          <span className={styles.text}>{t('account:choose_offer.watch_this_on_platform', { siteName })}</span>
          {startWatchingButton}
          {!isLogged && <Button onClick={loginButtonClickHandler} label={t('common:sign_in')} />}
        </div>
      </Fade>
      {!isLocked && (
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
      )}
    </div>
  );
};

export default InlinePlayer;
