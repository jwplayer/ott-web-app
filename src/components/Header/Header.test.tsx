import React from 'react';

import { render } from '../../testUtils';
import { ConfigStore } from '../../stores/ConfigStore';
import Button from '../Button/Button';

import Header from './Header';

describe('<Header />', () => {
  test('renders header', () => {
    ConfigStore.update((s) => {
      s.config.sso = { host: 'https://www.aws.com', clientId: '12345CLIENT' };
    });

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
        showPaymentsMenuItem={true}
      >
        {playlistMenuItems}
      </Header>,
    );

    expect(container).toMatchSnapshot();
  });
});
