import React from 'react';

import UserMenu from './UserMenu';

import { renderWithRouter } from '#test/testUtils';
import { CONTROLLERS } from '#src/ioc/types';

vi.mock('#src/ioc/container', () => ({
  useController: (type: symbol) => {
    switch (type) {
      case CONTROLLERS.Account:
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
