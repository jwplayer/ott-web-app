import React from 'react';
import { render } from '@testing-library/react';

import SubscriptionRenewed from './SubscriptionRenewed';

import customer from '#test/fixtures/customer.json';
import subscription from '#test/fixtures/subscription.json';
import type { Subscription } from '#types/subscription';
import type { Customer } from '#types/account';

describe('<SubscriptionRenewed>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<SubscriptionRenewed customer={customer as Customer} subscription={subscription as Subscription} onClose={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
