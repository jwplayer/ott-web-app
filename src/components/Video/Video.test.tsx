import React from 'react';
import { render } from '@testing-library/react';
import type { PlaylistItem } from 'types/playlist';

import Video from './Video';

describe('<Video>', () => {
  test('renders and matches snapshot', () => {
    const item = {
      description: 'Test item description',
      duration: 354,
      feedid: 'ax85aa',
      image: 'http://test/img.jpg',
      images: [],
      link: 'http://test/link',
      genre: 'Tester',
      mediaid: 'zp50pz',
      pubdate: 26092021,
      rating: 'CC_CC',
      sources: [],
      seriesId: 'ag94ag',
      tags: 'Test tag',
      title: 'Test item title',
      tracks: [],
    } as PlaylistItem;
    const { container } = render(
      <Video
        title="Test video"
        play
        item={item}
        allowedToWatch={true}
        startWatchingLabel="Start watching"
        onStartWatchingClick={vi.fn()}
        goBack={vi.fn()}
        poster="fading"
        hasShared={false}
        onShareClick={vi.fn()}
        enableSharing
        isFavorited={false}
        onFavoriteButtonClick={vi.fn()}
        playTrailer={false}
        onTrailerClick={vi.fn()}
        onTrailerClose={vi.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
