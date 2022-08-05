import React from 'react';
import { render } from '@testing-library/react';

import Player from './Player';

import type { PlaylistItem } from '#types/playlist';

describe('<Player>', () => {
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
    const { container } = render(<Player playerId="123456" item={item} onPlay={() => null} onPause={() => null} />);

    expect(container).toMatchSnapshot();
  });
});
