import React from 'react';
import ApiService from '@jwplayer/ott-common/src/services/api.service';
import { PersonalShelf } from '@jwplayer/ott-common/src/constants';

import PlaylistContainer from '../../containers/PlaylistContainer/PlaylistContainer';
import { renderWithRouter } from '../../../test/testUtils';

import Favorites from './Favorites';

vi.mock('@jwplayer/ott-common/src/modules/container', () => ({
  getModule: (type: typeof ApiService) => {
    switch (type) {
      case ApiService:
        return {
          getPlaylistById: vi.fn(() => ({
            id: 'fake_id',
          })),
        };
    }
  },
}));

describe('<Favorites>', () => {
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
