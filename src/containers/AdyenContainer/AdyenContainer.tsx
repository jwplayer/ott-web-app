import type { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';
import { useCallback, useEffect, useState } from 'react';
import type DropinElement from '@adyen/adyen-web/dist/types/components/Dropin/Dropin';
import { useNavigate } from 'react-router';

import useClientIntegration from '../../hooks/useClientIntegration';
import Adyen from '../../components/Adyen/Adyen';
import useQueryParam from '../../hooks/useQueryParam';
import { createAdyenPaymentSession, finalizeAdyenPayment, initialAdyenPayment } from '../../stores/CheckoutController';
import type { AdyenPaymentSession } from '../../../types/checkout';
import { reloadActiveSubscription } from '../../stores/AccountController';
import { addQueryParams } from '../../utils/formatting';

import { ADYEN_LIVE_CLIENT_KEY, ADYEN_TEST_CLIENT_KEY } from '#src/config';

type Props = {
  setUpdatingOrder: (loading: boolean) => void;
  setPaymentError: (errorMessage?: string) => void;
  type: AdyenPaymentMethodType;
  paymentSuccessUrl: string;
  orderId?: number;
};

export default function AdyenContainer({ setUpdatingOrder, type, setPaymentError, paymentSuccessUrl, orderId }: Props) {
  const [session, setSession] = useState<AdyenPaymentSession>();

  const { sandbox } = useClientIntegration();
  const navigate = useNavigate();

  const redirectResult = useQueryParam('redirectResult');
  const checkPayment = !!redirectResult;

  useEffect(() => {
    if (checkPayment) return;

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
  }, [setUpdatingOrder, checkPayment, setPaymentError]);

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

        const returnUrl = addQueryParams(window.origin, { u: 'finalize-payment', orderId: orderId });
        const result = await initialAdyenPayment(state.data.paymentMethod, returnUrl);

        if ('action' in result) {
          handleAction(result.action);
          return;
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

  const adyenConfiguration: CoreOptions = {
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
    onAdditionalDetails: async (state: CoreOptions['additionalData']) => {
      try {
        setUpdatingOrder(true);

        await finalizeAdyenPayment(orderId, state.data.details);

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
  };

  return <Adyen configuration={adyenConfiguration} type={type} />;
}
