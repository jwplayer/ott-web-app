import React from 'react';

import Account from './Account';

import customer from '#test/fixtures/customer.json';
import { useAccountStore } from '#src/stores/AccountStore';
import { renderWithRouter } from '#test/testUtils';
import type { Consent } from '#types/account';
import AccountController from '#src/stores/AccountController';

vi.mock('#src/modules/container', () => ({
  getModule: (type: typeof AccountController) => {
    switch (type) {
      case AccountController:
        return {
          exportAccountData: vi.fn(),
          getFeatures: vi.fn(() => ({ canChangePasswordWithOldPassword: false, canExportAccountData: false, canDeleteAccount: false })),
        };
    }
  },
}));

describe('<Account>', () => {
  test('renders and matches snapshot', () => {
    useAccountStore.setState({
      user: customer,
      publisherConsents: Array.of({ name: 'marketing', label: 'Receive Marketing Emails' } as Consent),
    });

    const { container } = renderWithRouter(<Account panelClassName={'panel-class'} panelHeaderClassName={'header-class'} canUpdateEmail={true} />);

    // todo
    expect(container).toMatchSnapshot();
  });
});
