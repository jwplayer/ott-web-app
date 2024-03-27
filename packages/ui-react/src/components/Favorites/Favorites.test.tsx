import React from 'react';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { mockService } from '@jwp/ott-common/test/mockService';
import favorites from '@jwp/ott-testing/fixtures/favorites.json';

import { renderWithRouter } from '../../../test/utils';

import Favorites from './Favorites';

describe('<Favorites>', () => {
  beforeEach(() => {
    // TODO: Remove ApiService from component
    mockService(ApiService, {});
  });

  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <Favorites playlist={favorites} onCardHover={() => null} onClearFavoritesClick={() => null} hasSubscription={true} accessModel={'SVOD'} />,
    );

    expect(container).toMatchSnapshot();
  });
});
