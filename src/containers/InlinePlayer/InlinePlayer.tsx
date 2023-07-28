import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import styles from './InlinePlayer.module.scss';

import Image from '#components/Image/Image';
import type { PlaylistItem } from '#types/playlist';
import Fade from '#components/Animation/Fade/Fade';
import Lock from '#src/icons/Lock';
import Button from '#components/Button/Button';
import { addQueryParam } from '#src/utils/location';
import { useConfigStore } from '#src/stores/ConfigStore';
import PlayerContainer from '#src/containers/PlayerContainer/PlayerContainer';

type Props = {
  item: PlaylistItem;
  seriesItem?: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  feedId?: string;
  liveStartDateTime?: string | null;
  liveEndDateTime?: string | null;
  liveFromBeginning?: boolean;
  startWatchingButton: React.ReactNode;
  isLoggedIn: boolean;
  paywall: boolean;
  playable?: boolean;
  autostart?: boolean;
};

const InlinePlayer: React.FC<Props> = ({
  item,
  seriesItem,
  onPlay,
  onPause,
  onComplete,
  feedId,
  liveStartDateTime,
  liveEndDateTime,
  liveFromBeginning,
  startWatchingButton,
  isLoggedIn,
  paywall,
  autostart,
  playable = true,
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
      <Fade open={!playable || paywall}>
        <div className={styles.paywall}>
          <Image className={styles.poster} image={item.backgroundImage} alt={item.title} width={1280} />
          {paywall && (
            <>
              <Lock className={styles.lock} />
              <h2 className={styles.title}>{t('video:sign_up_to_start_watching')}</h2>
              <span className={styles.text}>{t('account:choose_offer.watch_this_on_platform', { siteName })}</span>
              {startWatchingButton}
              {!isLoggedIn && <Button onClick={loginButtonClickHandler} label={t('common:sign_in')} />}
            </>
          )}
        </div>
      </Fade>
      {!paywall && playable && (
        <PlayerContainer
          item={item}
          seriesItem={seriesItem}
          feedId={feedId}
          autostart={autostart}
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
