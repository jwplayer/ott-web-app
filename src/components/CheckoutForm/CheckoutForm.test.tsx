import React from 'react';
import { render } from '@testing-library/react';

import offer from '../../fixtures/monthlyOffer.json';
import order from '../../fixtures/order.json';
import type { Offer, Order } from '../../../types/checkout';

import CheckoutForm from './CheckoutForm';

describe('<CheckoutForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<CheckoutForm onCloseCouponFormClick={jest.fn()} onCouponFormSubmit={jest.fn()} onRedeemCouponButtonClick={jest.fn()} onCouponInputChange={jest.fn()} onBackButtonClick={jest.fn()} onPaymentMethodChange={jest.fn()} couponFormOpen={false} couponFormApplied={false} couponInputValue="" couponFormError={undefined} couponFormSubmitting={false} order={order as Order} offer={offer as Offer} />);

    expect(container).toMatchSnapshot();
  });
});
