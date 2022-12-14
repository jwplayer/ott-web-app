import React from 'react';
import { render } from '@testing-library/react';

import RenewSubscriptionForm from './RenewSubscriptionForm';

import customer from '#test/fixtures/customer.json';
import subscription from '#test/fixtures/subscription.json';
import type { Subscription } from '#types/subscription';
import type { Customer } from '#types/account';

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
