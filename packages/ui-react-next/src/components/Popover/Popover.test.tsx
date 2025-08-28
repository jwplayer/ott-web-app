import React, { act } from 'react';
import { axe } from 'vitest-axe';

import { renderWithRouter } from '../../../test/utils';
import MenuButton from '../MenuButton/MenuButton';

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

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = renderWithRouter(
      <Popover isOpen={true} onClose={vi.fn()}>
        Content
      </Popover>,
    );

    await act(async () => {
      expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
    });
  });
});
