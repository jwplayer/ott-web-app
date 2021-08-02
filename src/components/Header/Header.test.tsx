import React from 'react';

import Button from '../Button/Button';
import { render } from '../../testUtils';

import Header from './Header';

describe('<Header />', () => {
  test('renders header', () => {
    const playlistMenuItems = [<Button key="key" label="Home" to="/" />];
    const { container } = render(
      <Header
        onMenuButtonClick={jest.fn()}
        searchBarProps={{
          query: '',
          onQueryChange: jest.fn(),
        }}
        searchEnabled
        searchActive={false}
        onSearchButtonClick={jest.fn()}
        onCloseSearchButtonClick={jest.fn()}
        onLoginButtonClick={jest.fn()}
        userMenuOpen={false}
        toggleUserMenu={jest.fn()}
        isLoggedIn={false}
        canLogin={true}
      >
        {playlistMenuItems}
      </Header>,
    );

    expect(container).toMatchSnapshot();
  });
});
