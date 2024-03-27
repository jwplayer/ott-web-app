import type { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type DropinElement from '@adyen/adyen-web/dist/types/components/Dropin/Dropin';
import { useNavigate } from 'react-router';
import type { AdyenPaymentSession } from '@jwp/ott-common/types/checkout';
import { getModule } from '@jwp/ott-common/src/modules/container';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { ADYEN_LIVE_CLIENT_KEY, ADYEN_TEST_CLIENT_KEY } from '@jwp/ott-common/src/constants';
import { useTranslation } from 'react-i18next';

import Adyen from '../../components/Adyen/Adyen';
import { useAriaAnnouncer } from '../AnnouncementProvider/AnnoucementProvider';

type Props = {
  setUpdatingOrder: (loading: boolean) => void;
  type: AdyenPaymentMethodType;
  paymentSuccessUrl: string;
  orderId?: number;
};

export default function AdyenInitialPayment({ setUpdatingOrder, type, paymentSuccessUrl, orderId }: Props) {
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);
  const { t } = useTranslation(['account', 'error']);
  const announce = useAriaAnnouncer();

  const [error, setError] = useState<string>();
  const [session, setSession] = useState<AdyenPaymentSession>();

  const isSandbox = accountController.getSandbox();
  const navigate = useNavigate();

  useEffect(() => {
    const createSession = async () => {
      setUpdatingOrder(true);

      try {
        const session = await checkoutController.createAdyenPaymentSession(window.origin);

        setSession(session);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }

      setUpdatingOrder(false);
    };

    createSession();
  }, [setUpdatingOrder, checkoutController]);

  const onSubmit = useCallback(
    async (state: AdyenEventData, handleAction: DropinElement['handleAction']) => {
      if (!state.isValid) return;

      try {
        setUpdatingOrder(true);
        setError(undefined);

        if (orderId === undefined) {
          setError(t('error:adyen_order_unknown'));
          return;
        }

        const returnUrl = createURL(window.location.href, {
          u: 'finalize-payment',
          orderId: orderId,
        });
        const result = await checkoutController.initialAdyenPayment(state.data.paymentMethod, returnUrl);

        if ('action' in result) {
          handleAction(result.action);
        }

        await accountController.reloadSubscriptions({ delay: 2000 });
        announce(t('account:checkout.payment_success'), 'success');
        navigate(paymentSuccessUrl, { replace: true });
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }

      setUpdatingOrder(false);
    },
    [setUpdatingOrder, orderId, checkoutController, accountController, announce, t, navigate, paymentSuccessUrl],
  );

  const adyenConfiguration: CoreOptions = useMemo(
    () => ({
      session: session,
      showPayButton: false,
      environment: isSandbox ? 'test' : 'live',
      clientKey: isSandbox ? ADYEN_TEST_CLIENT_KEY : ADYEN_LIVE_CLIENT_KEY,
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
          await checkoutController.finalizeAdyenPayment(orderId, data);

          announce(t('account:checkout.payment_success'), 'success');
          navigate(paymentSuccessUrl, { replace: true });
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message);
            setUpdatingOrder(false);
          }
        }
      },
      onSubmit: (state: AdyenEventData, component: DropinElement) => onSubmit(state, component.handleAction),
      onError: (error: Error) => setError(error.message),
    }),
    [session, isSandbox, setUpdatingOrder, checkoutController, orderId, announce, t, navigate, paymentSuccessUrl, onSubmit],
  );

  return <Adyen configuration={adyenConfiguration} type={type} error={error} />;
}
