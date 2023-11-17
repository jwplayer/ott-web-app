import React from 'react';
import AccountController from '@jwplayer/ott-common/src/stores/AccountController';

import { renderWithRouter } from '../../../test/testUtils';

import AccountModal from './AccountModal';

vi.mock('@jwplayer/ott-common/src/modules/container', () => ({
  getModule: (type: typeof AccountController) => {
    switch (type) {
      case AccountController:
        return {};
    }
  },
}));

describe('<AccountModal>', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<AccountModal />);

    expect(container).toMatchSnapshot();
  });
});
