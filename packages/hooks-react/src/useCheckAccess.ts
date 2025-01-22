import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';

type IntervalCheckAccessPayload = {
  interval?: number;
  iterations?: number;
  offerId?: string;
  callback?: ({ hasAccess, offerId }: { hasAccess: boolean; offerId: string }) => void;
};

const useCheckAccess = () => {
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);

  const intervalRef = useRef<number>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation('user');

  const offers = checkoutController.getSubscriptionOfferIds();

  const intervalCheckAccess = useCallback(
    ({ interval = 3000, iterations = 5, offerId = offers?.[0], callback }: IntervalCheckAccessPayload) => {
      if (!offerId) {
        callback?.({ hasAccess: false, offerId: '' });
        return;
      }

      intervalRef.current = window.setInterval(async () => {
        const hasAccess = await accountController.checkEntitlements(offerId);

        if (hasAccess) {
          window.clearInterval(intervalRef.current);
          // No duplicate retry mechanism. This can also be a TVOD offer which isn't validated using the
          // reloadSubscriptions method.
          await accountController.reloadSubscriptions();
          callback?.({ hasAccess: true, offerId: offerId || '' });
        } else if (--iterations === 0) {
          window.clearInterval(intervalRef.current);
          setErrorMessage(t('payment.longer_than_usual'));
          callback?.({ hasAccess: false, offerId: offerId || '' });
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
