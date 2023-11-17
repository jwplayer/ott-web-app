import React from 'react';
import { render } from '@testing-library/react';
import AccountController from '@jwplayer/ott-common/src/stores/AccountController';

import Button from '../Button/Button';

import Header from './Header';

vi.mock('react-router-dom', () => ({
  NavLink: () => 'a',
}));

vi.mock('@jwplayer/ott-common/src/modules/container', () => ({
  getModule: (type: typeof AccountController) => {
    switch (type) {
      case AccountController:
        return {
          logout: vi.fn(() => null),
        };
    }
  },
}));

describe('<Header />', () => {
  test('renders header', () => {
    const playlistMenuItems = [<Button key="key" label="Home" to="/" />];
    const { container } = render(
      <Header
        onMenuButtonClick={vi.fn()}
        searchBarProps={{
          query: '',
          onQueryChange: vi.fn(),
        }}
        searchEnabled
        searchActive={false}
        onSearchButtonClick={vi.fn()}
        onCloseSearchButtonClick={vi.fn()}
        onLoginButtonClick={vi.fn()}
        userMenuOpen={false}
        openUserMenu={vi.fn()}
        closeUserMenu={vi.fn()}
        openLanguageMenu={vi.fn()}
        closeLanguageMenu={vi.fn()}
        isLoggedIn={false}
        canLogin={true}
        showPaymentsMenuItem={true}
        supportedLanguages={[]}
        currentLanguage={undefined}
        languageMenuOpen={false}
        onLanguageClick={vi.fn()}
      >
        {playlistMenuItems}
      </Header>,
    );

    expect(container).toMatchSnapshot();
  });
});
