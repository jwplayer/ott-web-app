import React from 'react';

import Popover from './Popover';

import { renderWithRouter } from '#test/testUtils';
import MenuButton from '#components/MenuButton/MenuButton';

describe('<Popover>', () => {
  test('renders and matches snapshot', () => {
    const menuItems = [<MenuButton key="key" label="Home" to="/" />];

    const { container } = renderWithRouter(
      <Popover isOpen={true} onClose={vi.fn()}>
        {menuItems}
      </Popover>,
    );

    expect(container).toMatchSnapshot();
  });
});
