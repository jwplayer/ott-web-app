import * as React from 'react';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import playlistFixture from '@jwp/ott-testing/fixtures/playlist.json';

import { renderWithRouter } from '../../../test/utils';

import CardGrid from './CardGrid';

describe('<CardGrid>', () => {
  it('renders and matches snapshot', () => {
    const playlist = playlistFixture as Playlist;
    const { container } = renderWithRouter(
      <CardGrid
        playlist={playlist}
        onCardHover={vi.fn()}
        isLoading={false}
        accessModel={'SVOD'}
        isLoggedIn={true}
        hasSubscription={true}
        getUrl={(item: PlaylistItem) => `m/${item.mediaid}`}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
