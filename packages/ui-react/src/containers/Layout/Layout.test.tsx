import React from 'react';
import ProfileController from '@jwp/ott-common/src/stores/ProfileController';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';

import { renderWithRouter } from '../../../test/utils';

import Layout from './Layout';

describe('<Layout />', () => {
  beforeEach(() => {
    mockService(ProfileController, { isEnabled: vi.fn().mockReturnValue(false) });
    mockService(AccountController, { getFeatures: () => DEFAULT_FEATURES });
  });

  test('renders layout', () => {
    const { container } = renderWithRouter(<Layout />);

    expect(container).toMatchSnapshot();
  });
});
