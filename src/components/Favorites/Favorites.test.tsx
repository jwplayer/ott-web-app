import React from 'react';
import { renderWithRouter } from 'test/testUtils';

import { PersonalShelf } from '../../enum/PersonalShelf';
import PlaylistContainer from '../../containers/Playlist/PlaylistContainer';

import Favorites from './Favorites';

describe('<Favorites>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <PlaylistContainer playlistId={PersonalShelf.Favorites}>
        {({ playlist, error, isLoading }) => (
          <Favorites
            playlist={playlist.playlist}
            error={error}
            isLoading={isLoading}
            onCardClick={() => null}
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
