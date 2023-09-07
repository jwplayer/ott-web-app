import React from 'react';

import UserMenu from './UserMenu';

import { renderWithRouter } from '#test/testUtils';
import AccountController from '#src/controllers/AccountController';
import { container } from '#src/modules/container';

vi.spyOn(container, 'getAll').mockImplementation((type: unknown) => {
  switch (type) {
    case AccountController:
      return [{ logout: vi.fn() }];
    default:
      return [];
  }
});

describe('<UserMenu>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<UserMenu showPaymentsItem={true} />);

    expect(container).toMatchSnapshot();
  });
});
