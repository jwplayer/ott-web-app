import React from 'react';

import Favorites from './Favorites';

import { PersonalShelf } from '#src/config';
import PlaylistContainer from '#src/containers/PlaylistContainer/PlaylistContainer';
import { renderWithRouter } from '#test/testUtils';
import ApiService from '#src/services/api.service';

vi.mock('#src/modules/container', () => ({
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
