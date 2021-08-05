import React from 'react';

import { render } from '../../testUtils';
import { PersonalShelf } from '../../enum/PersonalShelf';
import PlaylistContainer from '../../containers/Playlist/PlaylistContainer';

import Favorites from './Favorites';

describe('<Favorites>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
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
