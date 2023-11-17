import React from 'react';
import type { Consent } from '@jwplayer/ott-common/types/account';
import { useAccountStore } from '@jwplayer/ott-common/src/stores/AccountStore';
import AccountController from '@jwplayer/ott-common/src/stores/AccountController';

import customer from '../../../test/fixtures/customer.json';
import { renderWithRouter } from '../../../test/testUtils';

import Account from './Account';

vi.mock('@jwplayer/ott-common/src/modules/container', () => ({
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
