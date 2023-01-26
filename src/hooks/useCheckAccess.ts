import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import useClientIntegration from './useClientIntegration';

import { addQueryParam } from '#src/utils/location';
import { checkEntitlements, reloadActiveSubscription } from '#src/stores/AccountController';

type intervalCheckAccessPayload = {
  interval?: number;
  iterations?: number;
  offerId?: string;
};
const useCheckAccess = () => {
  const intervalRef = useRef<number>();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState(null);
  const { t } = useTranslation('user');

  const intervalCheckAccess = useCallback(
    ({ interval = 3000, iterations = 5, offerId }: intervalCheckAccessPayload) => {
      const { clientOffers } = useClientIntegration();
      if (!offerId && clientOffers?.[0]) {
        offerId = clientOffers[0];
      }
      intervalRef.current = window.setInterval(async () => {
        const hasAccess = await checkEntitlements(offerId);

        if (hasAccess) {
          await reloadActiveSubscription();
          navigate(addQueryParam(location, 'u', 'welcome'));
        } else if (--iterations === 0) {
          window.clearInterval(intervalRef.current);
          setErrorMessage(t('payment.longer_than_usual'));
        }
      }, interval);
    },
    [intervalRef.current, errorMessage],
  );

  useEffect(() => {
    return () => {
      window.clearInterval(intervalRef.current);
    };
  }, []);

  return { intervalCheckAccess, errorMessage };
};

export default useCheckAccess;
