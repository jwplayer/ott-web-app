import React from 'react';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';

import { renderWithRouter } from '../../../test/utils';

import UserMenu from './UserMenu';

describe('<UserMenu>', () => {
  beforeEach(() => {
    // TODO: Remove AccountController from component
    mockService(AccountController, { getFeatures: () => DEFAULT_FEATURES });
  });

  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<UserMenu focusable={true} showPaymentsItem={true} />);

    expect(container).toMatchSnapshot();
  });
});
