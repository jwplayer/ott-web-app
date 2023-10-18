import React from 'react';
import { waitFor } from '@testing-library/react';

import Account from './Account';

import { renderWithRouter } from '#test/testUtils';
import { useAccountStore } from '#src/stores/AccountStore';
import type { Consent } from '#types/account';
import customer from '#test/fixtures/customer.json';

describe('<Account>', () => {
  test('renders and matches snapshot', async () => {
    useAccountStore.setState({
      user: customer,
      publisherConsents: Array.of({ name: 'marketing', label: 'Receive Marketing Emails' } as Consent),
    });

    const { container } = renderWithRouter(<Account panelClassName={'panel-class'} panelHeaderClassName={'header-class'} canUpdateEmail={true} />);

    await waitFor(() => {
      const loadingOverlay = container.querySelector('[class*="loadingOverlay"]');
      return !loadingOverlay;
    });

    expect(container).toMatchSnapshot();
  });
});
