import React from 'react';
import { axe } from 'vitest-axe';

import { renderWithRouter } from '../../../test/utils';

import UserMenu from './UserMenu';

describe('<UserMenu>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <UserMenu open={false} onOpen={vi.fn()} onClose={vi.fn()} favoritesEnabled isLoggedIn onLoginButtonClick={vi.fn()} onSignUpButtonClick={vi.fn()} />,
    );

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = renderWithRouter(
      <UserMenu open={false} onOpen={vi.fn()} onClose={vi.fn()} favoritesEnabled isLoggedIn onLoginButtonClick={vi.fn()} onSignUpButtonClick={vi.fn()} />,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
