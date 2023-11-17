import * as React from 'react';
import type { Playlist, PlaylistItem } from '@jwplayer/ott-common/types/playlist';

import playlistFixture from '../../../test/fixtures/playlist.json';
import { renderWithRouter } from '../../../test/testUtils';

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
