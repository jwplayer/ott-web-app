import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import Lock from '@jwp/ott-theme/assets/icons/lock.svg?react';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';

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
  isEntitled: boolean;
  playable?: boolean;
  autostart?: boolean;
  hasMediaOffers?: boolean;
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
  isEntitled,
  autostart,
  playable = true,
  hasMediaOffers,
}: Props) => {
  const siteName = useConfigStore((s) => s.config.siteName);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const loginButtonClickHandler = () => {
    navigate(modalURLFromLocation(location, 'login'));
  };

  const buyLabel = hasMediaOffers ? t('video:buy_to_start_watching') : t('video:sign_up_to_start_watching');

  return (
    <div className={styles.inlinePlayer}>
      <Fade open={!playable || !isEntitled}>
        <div className={styles.paywall}>
          <Image className={styles.poster} image={item.backgroundImage} alt={item.title} width={1280} />
          {!isEntitled && (
            <>
              <Icon icon={Lock} className={styles.lock} />
              <h2 className={styles.title}>{buyLabel}</h2>
              <span className={styles.text}>{t('account:choose_offer.watch_this_on_platform', { siteName })}</span>
              {startWatchingButton}
              {!isLoggedIn && <Button onClick={loginButtonClickHandler} label={t('common:sign_in')} />}
            </>
          )}
        </div>
      </Fade>
      {isEntitled && playable && (
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
