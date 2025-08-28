import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';
import Language from '@jwp/ott-theme/assets/icons/language.svg?react';

import Icon from '../Icon/Icon';

import Header from './Header';
import HeaderSkipLink from './HeaderSkipLink';
import HeaderMenu from './HeaderMenu';
import HeaderBrand from './HeaderBrand';
import HeaderNavigation from './HeaderNavigation';
import HeaderActions from './HeaderActions';
import HeaderActionButton from './HeaderActionButton';

vi.mock('react-router-dom', () => ({
  NavLink: () => 'a',
  Link: () => 'a',
}));

describe('<Header />', () => {
  test('renders header', () => {
    const { container } = render(
      <Header searchActive={false}>
        <HeaderSkipLink />
        <HeaderMenu onClick={vi.fn()} sideBarOpen={false} />
        <HeaderBrand logoSrc={undefined} setLogoLoaded={vi.fn()} siteName="OTT Web App" />
        <HeaderNavigation navItems={[]} />
        <HeaderActions>
          <HeaderActionButton>
            <Icon icon={Language} />
          </HeaderActionButton>
        </HeaderActions>
      </Header>,
    );

    expect(container).toMatchSnapshot();
  });

  test('renders header with nav buttons', () => {
    const navItems = [
      { label: 'Home', to: '/' },
      { label: 'Button test', to: '/test' },
    ];
    const { container } = render(
      <Header searchActive={false}>
        <HeaderSkipLink />
        <HeaderMenu onClick={vi.fn()} sideBarOpen={false} />
        <HeaderBrand logoSrc="/logo.png" setLogoLoaded={vi.fn()} siteName="OTT Web App" />
        <HeaderNavigation navItems={navItems} />
        <HeaderActions>
          <HeaderActionButton>
            <Icon icon={Language} />
          </HeaderActionButton>
        </HeaderActions>
      </Header>,
    );

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const navItems = [
      { label: 'Home', to: '/' },
      { label: 'Button test', to: '/test' },
    ];
    const { container } = render(
      <Header searchActive={false}>
        <HeaderSkipLink />
        <HeaderMenu onClick={vi.fn()} sideBarOpen={false} />
        <HeaderBrand logoSrc="/logo.png" setLogoLoaded={vi.fn()} siteName="OTT Web App" />
        <HeaderNavigation navItems={navItems} />
        <HeaderActions>
          <HeaderActionButton>
            <Icon icon={Language} />
          </HeaderActionButton>
        </HeaderActions>
      </Header>,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
