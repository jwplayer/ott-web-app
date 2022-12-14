import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { addQueryParam } from '#src/utils/location';

export type UseStartWatchingLabel = (
  isEntitled: boolean,
  hasMediaOffers: boolean,
  isLoggedIn: boolean,
  videoProgress?: number,
  videoUrl?: string | null,
) => {
  startWatchingLabel: string;
  handleStartWatchingClick: () => void;
};

const useStartWatchingButton: UseStartWatchingLabel = (isEntitled, hasMediaOffers, isLoggedIn, videoProgress, videoUrl) => {
  const { t } = useTranslation('video');
  const navigate = useNavigate();
  const location = useLocation();

  const startWatchingLabel = useMemo((): string => {
    if (isEntitled) return typeof videoProgress === 'number' ? t('continue_watching') : t('start_watching');
    if (hasMediaOffers) return t('buy');
    if (!isLoggedIn) return t('sign_up_to_start_watching');

    return t('complete_your_subscription');
  }, [isEntitled, isLoggedIn, hasMediaOffers, videoProgress, t]);

  const handleStartWatchingClick = useCallback(() => {
    if (isEntitled) return videoUrl && navigate(videoUrl);
    if (!isLoggedIn) return navigate(addQueryParam(location, 'u', 'create-account'));
    if (hasMediaOffers) return navigate(addQueryParam(location, 'u', 'choose-offer'));

    return navigate('/u/payments');
  }, [isEntitled, isLoggedIn, location, videoUrl, hasMediaOffers, navigate]);

  return {
    startWatchingLabel,
    handleStartWatchingClick,
  };
};

export default useStartWatchingButton;
