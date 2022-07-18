import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';

import styles from './StartWatchingButton.module.scss';

import Play from '#src/icons/Play';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Button from '#src/components/Button/Button';
import { addQueryParam } from '#src/utils/history';
import useEntitlement from '#src/hooks/useEntitlement';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import type { PlaylistItem } from '#types/playlist';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { episodeURLFromEpisode, videoUrl } from '#src/utils/formatting';

type Props = {
  item: PlaylistItem;
  seriesId?: string | null;
};

const StartWatchingButton: React.VFC<Props> = ({ item, seriesId }) => {
  const { t } = useTranslation('video');
  const history = useHistory();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
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
    const playlistId = searchParams.get('r');
    const videoPlayUrl = seriesId ? episodeURLFromEpisode(item, seriesId, playlistId, true) : videoUrl(item, playlistId, true);

    if (isEntitled) return videoPlayUrl && history.push(videoPlayUrl);
    if (!isLoggedIn) return history.push(addQueryParam(history, 'u', 'create-account'));
    if (hasMediaOffers) return history.push(addQueryParam(history, 'u', 'choose-offer'));

    return history.push('/u/payments');
  }, [item, seriesId, searchParams, isEntitled, history, isLoggedIn, hasMediaOffers]);

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
