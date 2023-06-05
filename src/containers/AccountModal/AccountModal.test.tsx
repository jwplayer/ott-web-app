import React from 'react';

import AccountModal from './AccountModal';

import { renderWithRouter } from '#test/testUtils';
import * as checkoutController from '#src/stores/CheckoutController';

describe('<AccountModal>', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders and matches snapshot', () => {
    const spy = vi.spyOn(checkoutController, 'getSubscriptionSwitches');
    spy.mockResolvedValue(undefined);

    const { container } = renderWithRouter(<AccountModal />);

    expect(container).toMatchSnapshot();
  });
});
