import React from 'react';
import type { CustomFormField } from '@jwp/ott-common/types/account';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import customer from '@jwp/ott-testing/fixtures/customer.json';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';

import { renderWithRouter } from '../../../../../test/utils';

import AccountSection from './AccountSection';

describe('<AccountSection>', () => {
  beforeEach(() => {
    mockService(AccountController, { getFeatures: () => DEFAULT_FEATURES });
  });

  test('renders and matches snapshot', () => {
    useAccountStore.setState({
      user: customer,
      publisherConsents: Array.of({ name: 'marketing', label: 'Receive Marketing Emails' } as CustomFormField),
    });

    const { container } = renderWithRouter(<AccountSection />);

    // todo
    expect(container).toMatchSnapshot();
  });
});
