import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getModule } from '@jwp/ott-common/src/modules/container';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';

const FinalizeStripePpvPayment = () => {
  const checkoutController = getModule(CheckoutController);

  const [searchParams, setSearchParams] = useSearchParams();

  const finalize = useCallback(async (paymentIntent: string) => {
    try {
      await checkoutController.finalizeStripePpvPayment(paymentIntent);

      setSearchParams({ u: 'waiting-for-payment' });
    } finally {
      // we don't need to handle any outcome here, it is handled by notifications
      // NotificationsTypes.CARD_SUCCESS and NotificationsTypes.CARD_FAILED
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');

    if (paymentIntent) {
      finalize(paymentIntent);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default FinalizeStripePpvPayment;
