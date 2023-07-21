import React from 'react';

import Shelf from '#components/Shelf/Shelf';
import { renderWithRouter } from '#test/testUtils';

const playlist = {
  playlist: [
    {
      mediaid: '1234abcd',
      title: 'Movie 1',
      description: 'This is a move One',
      duration: 30,
      feedid: 'ABCDEFGH',
      image: '',
      images: [],
      link: '',
      pubdate: 30000,
      sources: [],
    },
    {
      mediaid: 'aaaaaaaa',
      title: 'Movie 2',
      description: 'This is a move two',
      duration: 31,
      feedid: 'ABCDEFGH',
      image: '',
      images: [],
      link: '',
      pubdate: 30000,
      sources: [],
    },
    {
      mediaid: '12332123',
      title: 'Third movie',
      description: 'Shrek the Third',
      duration: 34,
      feedid: 'ABCDEFGH',
      image: '',
      images: [],
      link: '',
      pubdate: 30004,
      sources: [],
    },
    {
      mediaid: 'ddeeddee',
      title: 'Last playlist item',
      description: 'Indiana Jones and the Last Crusade',
      duration: 1232,
      feedid: 'ABCDEFGH',
      image: '',
      images: [],
      link: '',
      pubdate: 30001,
      sources: [],
    },
  ],
  title: 'My Playlist',
};

describe('Shelf Component tests', () => {
  test('Regular shelf', () => {
    const { container } = renderWithRouter(
      <Shelf
        title="Test Shelf"
        type={'playlist'}
        accessModel={'AVOD'}
        hasSubscription={true}
        isLoggedIn={true}
        playlist={playlist}
        enableCardTitles
        enableTitle
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('Featured shelf', () => {
    const { container } = renderWithRouter(
      <Shelf
        title="Featured Shelf"
        type={'playlist'}
        accessModel={'AUTHVOD'}
        hasSubscription={true}
        isLoggedIn={true}
        playlist={playlist}
        featured
        enableCardTitles
        enableTitle
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
