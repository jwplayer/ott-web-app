import React from 'react';
import { render } from '@testing-library/react';
import type { PlaylistItem } from 'types/playlist';

import { ConfigStore } from '../../stores/ConfigStore';

import Video from './Video';

describe('<Video>', () => {
  test('renders and matches snapshot', () => {
    ConfigStore.update((s) => {
      s.config.sso = { host: 'https://www.aws.com', clientId: '12345CLIENT' };
    });

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
        onStartWatchingClick={jest.fn()}
        goBack={jest.fn()}
        poster="fading"
        hasShared={false}
        onShareClick={jest.fn()}
        enableSharing
        isFavorited={false}
        onFavoriteButtonClick={jest.fn()}
        playTrailer={false}
        onTrailerClick={jest.fn()}
        onTrailerClose={jest.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
