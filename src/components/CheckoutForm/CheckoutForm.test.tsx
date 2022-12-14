import React from 'react';
import { render } from '@testing-library/react';

import CheckoutForm from './CheckoutForm';

import offer from '#test/fixtures/monthlyOffer.json';
import order from '#test/fixtures/order.json';
import type { Offer, Order } from '#types/checkout';

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
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
