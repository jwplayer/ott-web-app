import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import CheckoutForm from '../../../components/CheckoutForm/CheckoutForm';
import { CheckoutStore, createOrder, updateOrder, getPaymentMethods } from '../../../stores/CheckoutStore';
import { addQueryParam } from '../../../utils/history';
import useForm from '../../../hooks/useForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';

const Checkout = () => {
  const history = useHistory();
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [couponCodeApplied, setCouponCodeApplied] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<number | undefined>(undefined);

  const { order, offer, paymentMethods } = CheckoutStore.useState((s) => s);

  const couponCodeForm = useForm({ couponCode: '' }, async (values, { setSubmitting, setErrors }) => {
    setUpdatingOrder(true);
    setCouponCodeApplied(false);

    if (values.couponCode && order) {
      try {
        await updateOrder(order.id, paymentMethodId, values.couponCode);
        setCouponCodeApplied(true);
      } catch (error: unknown) {
        setErrors({ couponCode: 'Something went wrong!' });
      }
    }

    setUpdatingOrder(false);
    setSubmitting(false);
  });

  useEffect(() => {
    async function create() {
      if (offer) {
        setUpdatingOrder(true);
        setCouponCodeApplied(false);
        const methods = await getPaymentMethods();

        setPaymentMethodId(methods[0]?.id);

        await createOrder(offer.offerId, methods[0]?.id);
        setUpdatingOrder(false);
      }
    }

    if (!offer) {
      return history.replace(addQueryParam(history, 'u', 'choose-offer'));
    }

    create();
  }, [history, offer]);

  const backButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'choose-offer'));
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toPaymentMethodId = parseInt(event.target.value);

    setPaymentMethodId(toPaymentMethodId);

    if (order && toPaymentMethodId) {
      setUpdatingOrder(true);
      setCouponCodeApplied(false);
      updateOrder(order.id, toPaymentMethodId, couponCodeForm.values.couponCode)
        .catch((error: Error) => {
          if (error.message.includes(`Order with id ${order.id}} not found`)) {
            history.push(addQueryParam(history, 'u', 'choose-offer'));
          }
        })
        .finally(() => setUpdatingOrder(false));
    }
  };

  // loading state
  if (!offer || !order || !paymentMethods) {
    return (
      <div style={{ height: 300 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return (
    <React.Fragment>
      <CheckoutForm
        order={order}
        offer={offer}
        onBackButtonClick={backButtonClickHandler}
        paymentMethods={paymentMethods}
        paymentMethodId={paymentMethodId}
        onPaymentMethodChange={handlePaymentMethodChange}
        onCouponFormSubmit={couponCodeForm.handleSubmit}
        onCouponInputChange={couponCodeForm.handleChange}
        onRedeemCouponButtonClick={() => setCouponFormOpen(true)}
        onCloseCouponFormClick={() => setCouponFormOpen(false)}
        couponInputValue={couponCodeForm.values.couponCode}
        couponFormOpen={couponFormOpen}
        couponFormApplied={couponCodeApplied}
        couponFormSubmitting={couponCodeForm.submitting}
        couponFormError={!!couponCodeForm.errors.couponCode}
      />
      {updatingOrder ? <LoadingOverlay inline /> : null}
    </React.Fragment>
  );
};

export default Checkout;
