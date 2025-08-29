import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '@jwp/ott-common-next/types/playlist';
import { useCheckoutStore } from '@jwp/ott-common-next/src/stores/CheckoutStore';
import { useWatchHistoryStore } from '@jwp/ott-common-next/src/stores/WatchHistoryStore';
import { useAccountStore } from '@jwp/ott-common-next/src/stores/AccountStore';
import { modalURLFromLocation } from '@jwp/ott-ui-react-next/src/utils/location';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react-next/src/hooks/useBreakpoint';
import useEntitlement from '@jwp/ott-hooks-react-next/src/useEntitlement';
import Play from '@jwp/ott-theme/assets/icons/play.svg?react';
import { useConfigStore } from '@jwp/ott-common-next/src/stores/ConfigStore';
import { ACCESS_MODEL } from '@jwp/ott-common-next/src/constants';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Location } from 'react-router';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const location = useMemo(
    (): Location => ({
      hash: '',
      key: '',
      pathname: pathname || '',
      search: searchParams?.toString() || '',
      state: null,
    }),
    [pathname, searchParams],
  );
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

  const testId = useMemo(() => {
    if (isEntitled) return 'start_watching';
    if (hasMediaOffers) return 'buy';
    if (!isLoggedIn) return 'sign_up';

    return 'complete_subscription';
  }, [hasMediaOffers, isEntitled, isLoggedIn]);

  const handleStartWatchingClick = useCallback(() => {
    const navigate = router.push;

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
  }, [isEntitled, playUrl, router, isLoggedIn, location, hasMediaOffers, onClick]);

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
      data-testid={testId}
      data-mediaid={item.mediaid}
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
