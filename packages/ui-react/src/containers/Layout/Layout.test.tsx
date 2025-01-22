import React from 'react';
import { axe } from 'vitest-axe';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';
import FavoritesController from '@jwp/ott-common/src/controllers/FavoritesController';
import WatchHistoryController from '@jwp/ott-common/src/controllers/WatchHistoryController';

import { renderWithRouter } from '../../../test/utils';

import Layout from './Layout';

describe('<Layout />', () => {
  beforeEach(() => {
    mockService(AccountController, { getFeatures: () => DEFAULT_FEATURES });
    mockService(FavoritesController, {});
    mockService(WatchHistoryController, {});
  });

  test('renders layout', () => {
    const { container } = renderWithRouter(<Layout />);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = renderWithRouter(<Layout />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
