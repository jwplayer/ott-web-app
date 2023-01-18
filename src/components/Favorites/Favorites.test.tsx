import React from 'react';

import Favorites from './Favorites';

import { PersonalShelf } from '#src/stores/ConfigStore';
import PlaylistContainer from '#src/containers/PlaylistContainer/PlaylistContainer';
import { renderWithRouter } from '#test/testUtils';

describe('<Favorites>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <PlaylistContainer type={PersonalShelf.Favorites}>
        {({ playlist, error, isLoading }) => (
          <Favorites
            playlist={playlist}
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
