import React from 'react';
import { render } from '@testing-library/react';

import customer from '../../fixtures/customer.json';
import subscription from '../../fixtures/subscription.json';
import type { Subscription } from '../../../types/subscription';
import type { Customer } from '../../../types/account';

import SubscriptionRenewed from './SubscriptionRenewed';

describe('<SubscriptionRenewed>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<SubscriptionRenewed customer={customer as Customer} subscription={subscription as Subscription} onClose={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
