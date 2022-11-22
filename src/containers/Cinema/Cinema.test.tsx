import React from 'react';

import Cinema from './Cinema';

import { renderWithRouter } from '#test/testUtils';
import type { PlaylistItem } from '#types/playlist';

describe('<Cinema>', () => {
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
    const { container } = renderWithRouter(
      <Cinema item={item} onPlay={() => null} onPause={() => null} open={true} title={item.title} primaryMetadata="Primary metadata" />,
    );

    expect(container).toMatchSnapshot();
  });
});
