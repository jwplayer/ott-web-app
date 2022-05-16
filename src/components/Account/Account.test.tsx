import React from 'react';
import { render } from '@testing-library/react';

import customer from '../../fixtures/customer.json';
import { useAccountStore } from '../../stores/AccountStore';

import Account from './Account';

import type { Consent } from '#types/account';

describe('<Account>', () => {
  test('renders and matches snapshot', () => {
    useAccountStore.setState({
      user: customer,
      publisherConsents: Array.of({ name: 'marketing', label: 'Receive Marketing Emails' } as Consent),
    });

    const { container } = render(<Account panelClassName={'panel-class'} panelHeaderClassName={'header-class'} />);

    // todo
    expect(container).toMatchSnapshot();
  });
});
