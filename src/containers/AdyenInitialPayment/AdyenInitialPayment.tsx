import type { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type DropinElement from '@adyen/adyen-web/dist/types/components/Dropin/Dropin';
import { useNavigate } from 'react-router';

import { ADYEN_LIVE_CLIENT_KEY, ADYEN_TEST_CLIENT_KEY } from '#src/config';
import Adyen from '#components/Adyen/Adyen';
import useClientIntegration from '#src/hooks/useClientIntegration';
import { reloadActiveSubscription } from '#src/stores/AccountController';
import { addQueryParams } from '#src/utils/formatting';
import type { AdyenPaymentSession } from '#types/checkout';
import { createAdyenPaymentSession, finalizeAdyenPayment, initialAdyenPayment } from '#src/stores/CheckoutController';

type Props = {
  setUpdatingOrder: (loading: boolean) => void;
  setPaymentError: (errorMessage?: string) => void;
  type: AdyenPaymentMethodType;
  paymentSuccessUrl: string;
  orderId?: number;
};

export default function AdyenInitialPayment({ setUpdatingOrder, type, setPaymentError, paymentSuccessUrl, orderId }: Props) {
  const [session, setSession] = useState<AdyenPaymentSession>();

  const { sandbox } = useClientIntegration();
  const navigate = useNavigate();

  useEffect(() => {
    const createSession = async () => {
      setUpdatingOrder(true);

      try {
        const session = await createAdyenPaymentSession(window.origin);

        setSession(session);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setPaymentError(error.message);
        }
      }

      setUpdatingOrder(false);
    };

    createSession();
  }, [setUpdatingOrder, setPaymentError]);

  const onSubmit = useCallback(
    async (state: AdyenEventData, handleAction: DropinElement['handleAction']) => {
      if (!state.isValid) return;

      try {
        setUpdatingOrder(true);
        setPaymentError(undefined);

        if (orderId === undefined) {
          setPaymentError('Order is unknown');
          return;
        }

        const returnUrl = addQueryParams(window.location.href, { u: 'finalize-payment', orderId: orderId });
        const result = await initialAdyenPayment(state.data.paymentMethod, returnUrl);

        if ('action' in result) {
          handleAction(result.action);
        }

        await reloadActiveSubscription({ delay: 2000 });

        navigate(paymentSuccessUrl, { replace: true });
      } catch (error: unknown) {
        if (error instanceof Error) {
          setPaymentError(error.message);
        }
      }

      setUpdatingOrder(false);
    },
    [navigate, orderId, paymentSuccessUrl, setPaymentError, setUpdatingOrder],
  );

  const adyenConfiguration: CoreOptions = useMemo(
    () => ({
      session: session,
      showPayButton: false,
      environment: sandbox ? 'test' : 'live',
      clientKey: sandbox ? ADYEN_TEST_CLIENT_KEY : ADYEN_LIVE_CLIENT_KEY,
      paymentMethodsConfiguration: {
        card: {
          hasHolderName: true,
          holderNameRequired: true,
        },
      },
      onAdditionalDetails: async (state: AdyenAdditionalEventData) => {
        try {
          setUpdatingOrder(true);

          const data = state.data.details as number | undefined;

          await finalizeAdyenPayment(orderId, data);

          navigate(paymentSuccessUrl, { replace: true });
        } catch (error: unknown) {
          if (error instanceof Error) {
            setPaymentError(error.message);
            setUpdatingOrder(false);
          }
        }
      },
      onSubmit: (state: AdyenEventData, component: DropinElement) => onSubmit(state, component.handleAction),
      onError: (error: Error) => setPaymentError(error.message),
    }),
    [onSubmit, paymentSuccessUrl, sandbox, session, orderId, navigate, setPaymentError, setUpdatingOrder],
  );

  return <Adyen configuration={adyenConfiguration} type={type} />;
}
