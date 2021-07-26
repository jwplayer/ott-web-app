import React from 'react';

import { render } from '../../testUtils';
import MenuButton from '../MenuButton/MenuButton';

import Popover from './Popover';

describe('<Popover>', () => {
  test('renders and matches snapshot', () => {
    const menuItems = [<MenuButton key="key" label="Home" to="/" />];
    const { container } = render(
      <Popover isOpen={true} onClose={jest.fn()}>
        {menuItems}
      </Popover>,
    );

    expect(container).toMatchSnapshot();
  });
});
