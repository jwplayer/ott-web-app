import React from 'react';
import AccountController from '@jwplayer/ott-common/src/stores/AccountController';

import { renderWithRouter } from '../../../test/testUtils';

import UserMenu from './UserMenu';

vi.mock('@jwplayer/ott-common/src/modules/container', () => ({
  getModule: (type: typeof AccountController) => {
    switch (type) {
      case AccountController:
        return { logout: vi.fn() };
    }
  },
}));

describe('<UserMenu>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<UserMenu showPaymentsItem={true} />);

    expect(container).toMatchSnapshot();
  });
});
