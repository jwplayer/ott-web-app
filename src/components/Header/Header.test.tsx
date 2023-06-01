import React from 'react';
import { render } from '@testing-library/react';

import Header from './Header';

import Button from '#components/Button/Button';

vi.mock('react-router-dom', () => ({
  NavLink: () => 'a',
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
