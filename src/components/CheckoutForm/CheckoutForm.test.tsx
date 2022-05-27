import React from 'react';
import { render } from '@testing-library/react';

import offer from '../../fixtures/monthlyOffer.json';
import order from '../../fixtures/order.json';
import type { Offer, Order } from '../../../types/checkout';

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
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
