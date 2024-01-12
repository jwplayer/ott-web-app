import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import Lock from '@jwp/ott-theme/assets/icons/lock.svg?react';
import { modalURL } from '@jwp/ott-ui-react/src/utils/location';

import Image from '../../components/Image/Image';
import Fade from '../../components/Animation/Fade/Fade';
import Button from '../../components/Button/Button';
import PlayerContainer from '../PlayerContainer/PlayerContainer';
import Icon from '../../components/Icon/Icon';

import styles from './InlinePlayer.module.scss';

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
    navigate(modalURL(location, 'login'));
  };

  return (
    <div className={styles.inlinePlayer}>
      <Fade open={!playable || paywall}>
        <div className={styles.paywall}>
          <Image className={styles.poster} image={item.backgroundImage} alt={item.title} width={1280} />
          {paywall && (
            <>
              <Icon icon={Lock} className={styles.lock} />
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
