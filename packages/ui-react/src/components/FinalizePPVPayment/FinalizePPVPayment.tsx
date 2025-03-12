import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getModule } from '@jwp/ott-common/src/modules/container';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';

import Spinner from '../Spinner/Spinner';

// Stripe returns many search parameters we don't use, so once we're redirected here we remove any search parameter that is not included in this list
const KNOWN_PARAMS = ['app-config'];

const FinalizePPVPayment = () => {
  const checkoutController = getModule(CheckoutController);
  const accountController = getModule(AccountController);

  const [searchParams, setSearchParams] = useSearchParams();

  const finalize = useCallback(async (paymentIntent: string) => {
    try {
      await checkoutController.finalizePpvPayment(paymentIntent);
      await accountController.reloadSubscriptions();
    } finally {
      // we don't need to handle any outcome, it is handled by notifications
      // NotificationsTypes.CARD_SUCCESS and NotificationsTypes.CARD_FAILED
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');

    if (paymentIntent) {
      setSearchParams(Object.fromEntries(Array.from(searchParams).filter(([name]) => KNOWN_PARAMS.includes(name))));
      finalize(paymentIntent);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '90px', marginTop: '24px' }}>
      <Spinner />
    </div>
  );
};

export default FinalizePPVPayment;
