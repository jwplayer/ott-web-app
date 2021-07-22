import React from 'react';
import { render } from '@testing-library/react';

import MenuButton from '../MenuButton/MenuButton';
import UserMenu from '../UserMenu/UserMenu';

import Popover from './Popover';

describe('<Popover>', () => {
  test('renders and matches snapshot', () => {
    const menuItems = [<MenuButton key="key" label="Home" to="/" />];
    const { container } = render(<Popover popoverButtonIcon={<UserMenu />}>{menuItems}</Popover>);

    expect(container).toMatchSnapshot();
  });
});
