import React from 'react';
import { axe } from 'vitest-axe';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';

import { renderWithRouter } from '../../../test/utils';

import UserMenuNav from './UserMenuNav';

describe('<UserMenu>', () => {
  beforeEach(() => {
    // TODO: Remove AccountController from component
    mockService(AccountController, { getFeatures: () => DEFAULT_FEATURES });
  });

  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<UserMenuNav focusable={true} showPaymentItems={true} />);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = renderWithRouter(<UserMenuNav focusable={true} showPaymentItems={true} />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
