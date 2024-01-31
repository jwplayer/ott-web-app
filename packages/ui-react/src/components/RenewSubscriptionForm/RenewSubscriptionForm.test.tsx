import React from 'react';
import { render } from '@testing-library/react';
import type { Subscription } from '@jwp/ott-common/types/subscription';
import type { Customer } from '@jwp/ott-common/types/account';
import customer from '@jwp/ott-testing/fixtures/customer.json';
import subscription from '@jwp/ott-testing/fixtures/subscription.json';

import RenewSubscriptionForm from './RenewSubscriptionForm';

describe('<RenewSubscriptionForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <RenewSubscriptionForm
        customer={customer as Customer}
        subscription={subscription as Subscription}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
        error={null}
        submitting={false}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
