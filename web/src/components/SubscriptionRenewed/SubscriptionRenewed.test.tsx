import React from 'react';
import { render } from '@testing-library/react';
import type { Subscription } from '@jwplayer/ott-common/types/subscription';
import type { Customer } from '@jwplayer/ott-common/types/account';

import customer from '../../../test/fixtures/customer.json';
import subscription from '../../../test/fixtures/subscription.json';

import SubscriptionRenewed from './SubscriptionRenewed';

describe('<SubscriptionRenewed>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<SubscriptionRenewed customer={customer as Customer} subscription={subscription as Subscription} onClose={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
