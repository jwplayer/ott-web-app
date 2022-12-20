import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

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

  const intervalCheckAccess = ({ interval = 3000, iterations = 5, offerId }: intervalCheckAccessPayload) => {
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
      }
    }, interval);
  };

  useEffect(() => {
    return () => {
      window.clearInterval(intervalRef.current);
    };
  }, []);

  return { intervalCheckAccess };
};

export default useCheckAccess;
