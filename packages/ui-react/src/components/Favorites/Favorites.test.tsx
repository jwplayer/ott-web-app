import React from 'react';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { PersonalShelf } from '@jwp/ott-common/src/constants';
import { mockService } from '@jwp/ott-common/test/mockService';

import { renderWithRouter } from '../../../test/utils';
import PlaylistContainer from '../../containers/PlaylistContainer/PlaylistContainer';

import Favorites from './Favorites';

describe('<Favorites>', () => {
  beforeEach(() => {
    // TODO: Remove ApiService from component
    mockService(ApiService, {});
  });

  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <PlaylistContainer type={PersonalShelf.Favorites}>
        {({ playlist, error, isLoading }) => (
          <Favorites
            playlist={playlist}
            error={error}
            isLoading={isLoading}
            onCardHover={() => null}
            onClearFavoritesClick={() => null}
            hasSubscription={true}
            accessModel={'SVOD'}
          />
        )}
      </PlaylistContainer>,
    );

    expect(container).toMatchSnapshot();
  });
});
