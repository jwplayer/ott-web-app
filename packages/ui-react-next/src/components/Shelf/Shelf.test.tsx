import React from 'react';
import { axe } from 'vitest-axe';

import { renderWithRouter } from '../../../test/utils';

import Shelf from './Shelf';

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

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = renderWithRouter(
      <>
        <h2>Regular shelf</h2>
        <Shelf
          title="Test Shelf"
          type={'playlist'}
          accessModel={'AVOD'}
          hasSubscription={true}
          isLoggedIn={true}
          playlist={playlist}
          enableCardTitles
          enableTitle
        />
        <h2>Featured shelf</h2>
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
        />
      </>,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
