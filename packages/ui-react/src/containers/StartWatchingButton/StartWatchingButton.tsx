import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import { useWatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import useEntitlement from '@jwp/ott-hooks-react/src/useEntitlement';
import Play from '@jwp/ott-theme/assets/icons/play.svg?react';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';

import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';

import styles from './StartWatchingButton.module.scss';

type Props = {
  item: PlaylistItem;
  playUrl?: string;
  disabled?: boolean;
  onClick?: () => void;
};

const StartWatchingButton: React.VFC<Props> = ({ item, playUrl, disabled = false, onClick }) => {
  const { t } = useTranslation('video');
  const navigate = useNavigate();
  const location = useLocation();
  const breakpoint = useBreakpoint();

  // account
  const accessModel = useConfigStore((state) => state.accessModel);
  const user = useAccountStore((state) => state.user);
  const isLoggedIn = !!user;

  // watch history
  const watchHistoryItem = useWatchHistoryStore((state) => item && state.getItem(item));
  const videoProgress = watchHistoryItem?.progress;

  // entitlement
  const setRequestedMediaOffers = useCheckoutStore((s) => s.setRequestedMediaOffers);
  const { isEntitled, mediaOffers } = useEntitlement(item);
  const hasMediaOffers = !!mediaOffers.length;

  const startWatchingLabel = useMemo((): string => {
    if (isEntitled) return typeof videoProgress === 'number' ? t('continue_watching') : t('start_watching');
    if (hasMediaOffers) return t('buy');
    if (!isLoggedIn) return t('sign_up_to_start_watching');

    return t('complete_your_subscription');
  }, [isEntitled, isLoggedIn, hasMediaOffers, videoProgress, t]);

  const handleStartWatchingClick = useCallback(() => {
    if (isEntitled) {
      if (onClick) {
        onClick();
        return;
      }
      return playUrl && navigate(playUrl);
    }
    if (!isLoggedIn) return navigate(modalURLFromLocation(location, 'create-account'));
    if (hasMediaOffers) return navigate(modalURLFromLocation(location, 'choose-offer'));

    return navigate('/u/payments');
  }, [isEntitled, playUrl, navigate, isLoggedIn, location, hasMediaOffers, onClick]);

  useEffect(() => {
    // set the TVOD mediaOffers in the checkout store
    setRequestedMediaOffers(mediaOffers);

    return () => setRequestedMediaOffers([]);
  }, [mediaOffers, setRequestedMediaOffers]);

  // the user can't purchase access in an AVOD platform due to missing configuration, so we hide the button
  if (accessModel === ACCESS_MODEL.AVOD && !isEntitled) {
    return null;
  }

  return (
    <Button
      color="primary"
      variant="contained"
      size="large"
      label={startWatchingLabel}
      startIcon={isEntitled ? <Icon icon={Play} /> : undefined}
      onClick={handleStartWatchingClick}
      fullWidth={breakpoint < Breakpoint.md}
      disabled={disabled}
    >
      {videoProgress ? (
        <div className={styles.progressRail}>
          <div className={styles.progress} style={{ width: `${videoProgress * 100}%` }} />
        </div>
      ) : null}
    </Button>
  );
};

export default StartWatchingButton;
