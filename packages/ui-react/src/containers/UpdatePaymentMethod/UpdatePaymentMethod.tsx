import React, { useEffect, useState } from 'react';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import useQueryParam from '@jwp/ott-ui-react/src/hooks/useQueryParam';

import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import PaymentMethodForm from '../../components/PaymentMethodForm/PaymentMethodForm';
import PayPal from '../../components/PayPal/PayPal';
import AdyenPaymentDetails from '../AdyenPaymentDetails/AdyenPaymentDetails';
import { modalURLFromWindowLocation } from '../../utils/location';

type Props = {
  onCloseButtonClick: () => void;
};

const UpdatePaymentMethod = ({ onCloseButtonClick }: Props) => {
  const checkoutController = getModule(CheckoutController);

  const updateSuccess = useQueryParam('u') === 'payment-method-success';
  const paymentMethodIdQueryParam = useQueryParam('paymentMethodId');
  const parsedPaymentMethodId = paymentMethodIdQueryParam ? parseInt(paymentMethodIdQueryParam) : undefined;

  const activePayment = useAccountStore((state) => state.activePayment);
  const currentPaymentId = activePayment?.id;
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);
  const [paymentMethodId, setPaymentMethodId] = useState<number | undefined>(parsedPaymentMethodId);

  const paymentMethods = useCheckoutStore((state) => state.paymentMethods);

  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    checkoutController.getPaymentMethods();
  }, [checkoutController]);

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toPaymentMethodId = parseInt(event.target.value);

    setPaymentMethodId(toPaymentMethodId);
    setPaymentError(undefined);
  };

  const handlePayPalSubmit = async () => {
    setProcessing(true);

    try {
      setPaymentError(undefined);

      const successUrl = modalURLFromWindowLocation('payment-method-success');
      const waitingUrl = modalURLFromWindowLocation('waiting-for-payment');
      const cancelUrl = modalURLFromWindowLocation('payment-cancelled');
      const errorUrl = modalURLFromWindowLocation('payment-error');

      const response = await checkoutController.updatePayPalPaymentMethod(
        successUrl,
        waitingUrl,
        cancelUrl,
        errorUrl,
        paymentMethodId as number,
        currentPaymentId,
      );

      if (response) {
        window.location.href = response.redirectUrl;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPaymentError(error.message);
      }
    }
    setProcessing(false);
  };

  const renderPaymentMethod = () => {
    const paymentMethod = paymentMethods?.find((method) => method.id === paymentMethodId);

    if (paymentMethod?.methodName === 'card') {
      return (
        <AdyenPaymentDetails
          paymentMethodId={paymentMethod.id}
          setPaymentError={setPaymentError}
          setProcessing={setProcessing}
          error={paymentError}
          type="card"
        />
      );
    } else if (paymentMethod?.methodName === 'paypal') {
      return <PayPal onSubmit={handlePayPalSubmit} error={paymentError || null} />;
    }

    return null;
  };

  // loading state
  if (!paymentMethods) {
    return (
      <div style={{ height: 300 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return (
    <PaymentMethodForm
      onCloseButtonClick={onCloseButtonClick}
      paymentMethods={paymentMethods}
      paymentMethodId={paymentMethodId}
      onPaymentMethodChange={handlePaymentMethodChange}
      renderPaymentMethod={renderPaymentMethod}
      updateSuccess={updateSuccess}
      submitting={processing}
    />
  );
};

export default UpdatePaymentMethod;
