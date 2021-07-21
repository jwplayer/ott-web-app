import React from 'react';
import { render } from '@testing-library/react';

import QueryProvider from '../../providers/QueryProvider';
import { PersonalShelf } from '../../enum/PersonalShelf';
import PlaylistContainer from '../../containers/Playlist/PlaylistContainer';

import Favorites from './Favorites';

describe('<Favorites>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <QueryProvider>
        <PlaylistContainer playlistId={PersonalShelf.Favorites}>
          {({ playlist, error, isLoading }) => (
            <Favorites
              playlist={playlist.playlist}
              error={error}
              isLoading={isLoading}
              onCardClick={() => null}
              onCardHover={() => null}
              onClearFavoritesClick={() => null}
            />
          )}
        </PlaylistContainer>
      </QueryProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});
