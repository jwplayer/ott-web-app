import React from 'react';

import Favorites from './Favorites';

import { PersonalShelf } from '#src/config';
import PlaylistContainer from '#src/containers/PlaylistContainer/PlaylistContainer';
import { renderWithRouter } from '#test/testUtils';
import ApiController from '#src/stores/ApiController';
import { container } from '#src/modules/container';

vi.spyOn(container, 'getAll').mockImplementation((type: unknown) => {
  if (type === ApiController) {
    return [
      {
        getPlaylistById: vi.fn(() => ({
          id: 'fake_id',
        })),
      },
    ];
  }

  return [];
});

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
