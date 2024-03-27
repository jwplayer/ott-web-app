import React from 'react';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';

import { renderWithRouter } from '../../../test/utils';

import AccountModal from './AccountModal';

describe('<AccountModal>', () => {
  beforeEach(() => {
    mockService(AccountController, { getFeatures: () => DEFAULT_FEATURES });
  });

  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<AccountModal />);

    expect(container).toMatchSnapshot();
  });
});
