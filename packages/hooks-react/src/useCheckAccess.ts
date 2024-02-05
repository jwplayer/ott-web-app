import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';

import useOffers from './useOffers';

type IntervalCheckAccessPayload = {
  interval?: number;
  iterations?: number;
  offerId?: string;
  callback?: (hasAccess: boolean) => void;
};

const useCheckAccess = () => {
  const accountController = getModule(AccountController);

  const intervalRef = useRef<number>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation('user');

  const { availableOffers: offers } = useOffers();

  const intervalCheckAccess = useCallback(
    ({ interval = 3000, iterations = 5, offerId, callback }: IntervalCheckAccessPayload) => {
      if (!offerId && offers?.[0]) {
        offerId = offers[0]?.offerId;
      }

      intervalRef.current = window.setInterval(async () => {
        const hasAccess = await accountController.checkEntitlements(offerId);

        if (hasAccess) {
          await accountController.reloadSubscriptions();
          callback?.(true);
        } else if (--iterations === 0) {
          window.clearInterval(intervalRef.current);
          setErrorMessage(t('payment.longer_than_usual'));
          callback?.(false);
        }
      }, interval);
    },
    [offers, t, accountController],
  );

  useEffect(() => {
    return () => {
      window.clearInterval(intervalRef.current);
    };
  }, []);

  return { intervalCheckAccess, errorMessage };
};

export default useCheckAccess;
