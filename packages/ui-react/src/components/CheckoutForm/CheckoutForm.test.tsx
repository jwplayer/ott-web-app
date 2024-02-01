import React from 'react';
import { render } from '@testing-library/react';
import type { Offer, Order } from '@jwp/ott-common/types/checkout';
import offer from '@jwp/ott-testing/fixtures/monthlyOffer.json';
import order from '@jwp/ott-testing/fixtures/order.json';

import PaymentForm from '../PaymentForm/PaymentForm';

import CheckoutForm from './CheckoutForm';

describe('<CheckoutForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <CheckoutForm
        onCloseCouponFormClick={vi.fn()}
        onCouponFormSubmit={vi.fn()}
        onRedeemCouponButtonClick={vi.fn()}
        onCouponInputChange={vi.fn()}
        onBackButtonClick={vi.fn()}
        onPaymentMethodChange={vi.fn()}
        couponFormOpen={false}
        couponFormApplied={false}
        couponInputValue=""
        couponFormError={undefined}
        couponFormSubmitting={false}
        order={order as Order}
        offer={offer as Offer}
        offerType={'svod'}
        submitting={false}
      >
        <PaymentForm onPaymentFormSubmit={vi.fn()} />
      </CheckoutForm>,
    );

    expect(container).toMatchSnapshot();
  });
});
