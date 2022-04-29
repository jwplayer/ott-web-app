import React from 'react';
import { renderWithRouter } from 'test/testUtils';
import MenuButton from 'src/components/MenuButton/MenuButton';

import Popover from './Popover';

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
