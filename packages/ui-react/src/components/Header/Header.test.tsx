import React from 'react';
import { render } from '@testing-library/react';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';

import Button from '../Button/Button';

import Header from './Header';

vi.mock('react-router-dom', () => ({
  NavLink: () => 'a',
}));

describe('<Header />', () => {
  beforeEach(() => {
    // TODO: remove AccountController from component
    mockService(AccountController, { getFeatures: () => DEFAULT_FEATURES });
  });

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
        sideBarOpen={false}
        openUserPanel={vi.fn()}
        closeUserPanel={vi.fn()}
        openLanguageMenu={vi.fn()}
        closeLanguageMenu={vi.fn()}
        isLoggedIn={false}
        canLogin={true}
        showPaymentsMenuItem={true}
        supportedLanguages={[]}
        languageMenuOpen={false}
        currentLanguage={undefined}
        onLanguageClick={vi.fn()}
      >
        {playlistMenuItems}
      </Header>,
    );

    expect(container).toMatchSnapshot();
  });
});
