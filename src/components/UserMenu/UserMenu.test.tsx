import React from 'react';

import UserMenu from './UserMenu';

import { renderWithRouter } from '#test/testUtils';
import AccountController from '#src/stores/AccountController';

vi.mock('#src/modules/container', () => ({
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
