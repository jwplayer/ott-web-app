import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import { addQueryParam } from '../utils/history';

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
  const history = useHistory();

  const startWatchingLabel = useMemo((): string => {
    if (isEntitled) return typeof videoProgress === 'number' ? t('continue_watching') : t('start_watching');
    if (hasMediaOffers) return t('buy');
    if (!isLoggedIn) return t('sign_up_to_start_watching');

    return t('complete_your_subscription');
  }, [isEntitled, isLoggedIn, hasMediaOffers, videoProgress, t]);

  const handleStartWatchingClick = useCallback(() => {
    if (isEntitled) return videoUrl && history.push(videoUrl);
    if (!isLoggedIn) return history.push(addQueryParam(history, 'u', 'create-account'));
    if (hasMediaOffers) return history.push(addQueryParam(history, 'u', 'choose-offer'));

    return history.push('/u/payments');
  }, [isEntitled, isLoggedIn, history, videoUrl, hasMediaOffers]);

  return {
    startWatchingLabel,
    handleStartWatchingClick,
  };
};

export default useStartWatchingButton;
