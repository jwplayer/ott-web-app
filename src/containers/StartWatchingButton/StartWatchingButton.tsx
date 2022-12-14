import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import styles from './StartWatchingButton.module.scss';

import Play from '#src/icons/Play';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Button from '#components/Button/Button';
import { addQueryParam } from '#src/utils/location';
import useEntitlement from '#src/hooks/useEntitlement';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import type { PlaylistItem } from '#types/playlist';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useAccountStore } from '#src/stores/AccountStore';

type Props = {
  item: PlaylistItem;
  playUrl: string;
  disabled?: boolean;
};

const StartWatchingButton: React.VFC<Props> = ({ item, playUrl, disabled = false }) => {
  const { t } = useTranslation('video');
  const navigate = useNavigate();
  const location = useLocation();
  const breakpoint = useBreakpoint();

  // account
  const auth = useAccountStore((state) => state.auth);
  const isLoggedIn = !!auth;

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
    if (isEntitled) return playUrl && navigate(playUrl);
    if (!isLoggedIn) return navigate(addQueryParam(location, 'u', 'create-account'));
    if (hasMediaOffers) return navigate(addQueryParam(location, 'u', 'choose-offer'));

    return navigate('/u/payments');
  }, [isEntitled, playUrl, navigate, isLoggedIn, location, hasMediaOffers]);

  useEffect(() => {
    // set the TVOD mediaOffers in the checkout store
    setRequestedMediaOffers(mediaOffers.length ? mediaOffers : null);

    return () => setRequestedMediaOffers(null);
  }, [mediaOffers, setRequestedMediaOffers]);

  return (
    <Button
      color="primary"
      variant="contained"
      size="large"
      label={startWatchingLabel}
      startIcon={isEntitled ? <Play /> : undefined}
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
