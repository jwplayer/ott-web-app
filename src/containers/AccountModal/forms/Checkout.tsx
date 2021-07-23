import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useQuery } from 'react-query';

import CheckoutForm from '../../../components/CheckoutForm/CheckoutForm';
import { CheckoutStore, createOrder, updateOrder } from '../../../stores/CheckoutStore';
import { addQueryParam } from '../../../utils/history';
import { ConfigContext } from '../../../providers/ConfigProvider';
import { getPaymentMethods } from '../../../services/checkout.service';
import { AccountStore } from '../../../stores/AccountStore';
import useForm from '../../../hooks/useForm';

const Checkout = () => {
  const history = useHistory();
  const { cleengSandbox } = useContext(ConfigContext);
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [couponCodeApplied, setCouponCodeApplied] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<number | undefined>(undefined);

  const auth = AccountStore.useState((s) => s.auth);
  const order = CheckoutStore.useState((s) => s.order);
  const offer = CheckoutStore.useState((s) => s.offer);

  const { data } = useQuery('paymentMethods', () => (auth?.jwt ? getPaymentMethods(cleengSandbox, auth.jwt) : null));

  const couponCodeForm = useForm({ couponCode: '' }, async (values, { setSubmitting, setErrors }) => {
    setCouponCodeApplied(false);

    if (values.couponCode && order) {
      try {
        await updateOrder(order.id, paymentMethodId, values.couponCode);
        setCouponCodeApplied(true);
      } catch (error: unknown) {
        setErrors({ couponCode: 'Something went wrong!' })
      }
    }

    setSubmitting(false);
  });

  const paymentMethods = data?.responseData?.paymentMethods;
  useEffect(() => {
    if (offer && paymentMethodId) {
      createOrder(offer.offerId, paymentMethodId)
    }
  }, [offer, paymentMethodId]);

  useEffect(() => {
    if (paymentMethods) {
      setPaymentMethodId(paymentMethods[0]?.id);
    }
  }, [paymentMethods]);

  const backButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'choose-offer'));
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toPaymentMethodId = parseInt(event.target.value);

    setPaymentMethodId(toPaymentMethodId);

    if (order && toPaymentMethodId) {
      updateOrder(order.id, toPaymentMethodId, couponCodeForm.values.couponCode);
    }
  };

  return (
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
  );
};

export default Checkout;
