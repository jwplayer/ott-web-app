import React from 'react';
import type { UseQueryResult } from 'react-query';

import Home from './Home';

import { renderWithRouter } from '#test/testUtils';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Playlist } from '#types/playlist';

describe('Home Component tests', () => {
  test('Home test', () => {
    useConfigStore.setState({
      config: {
        description: '',
        integrations: {},
        assets: {},
        menu: [],
        styling: {},
        content: [
          {
            title: 'This is a playlist',
            type: 'playlist',
            contentId: 'abcddfff',
          },
          {
            title: 'Second Playlist',
            type: 'playlist',
            contentId: 'abcddffg',
          },
        ],
      },
    });

    vi.mock('#src/hooks/usePlaylist', () => ({
      default: (): UseQueryResult<Playlist | undefined> => {
        return {
          dataUpdatedAt: 0,
          error: null,
          errorUpdatedAt: 0,
          failureCount: 0,
          isError: false,
          isFetched: false,
          isFetchedAfterMount: false,
          isFetching: false,
          isIdle: false,
          isLoading: false,
          isLoadingError: false,
          isPlaceholderData: false,
          isPreviousData: false,
          isRefetchError: false,
          isRefetching: false,
          isStale: false,
          isSuccess: true,
          refetch: () => {
            throw 'not implemented';
          },
          remove: () => {
            /**/
          },
          status: 'success',
          data: {
            title: 'My Playlist',
            playlist: [
              {
                mediaid: 'abcddabc',
                title: 'My video',
                description: 'This is a video',
                duration: 332,
                feedid: 'sdfsdsd',
                image: '',
                images: [],
                link: '',
                pubdate: 30000,
                sources: [],
              },
              {
                mediaid: 'zzzaaazz',
                title: 'Other Vids',
                description: 'Other',
                duration: 331,
                feedid: 'aaaaaaaa',
                image: '',
                images: [],
                link: '',
                pubdate: 30000,
                sources: [],
              },
            ],
          },
        };
      },
    }));

    const { container } = renderWithRouter(<Home />);

    expect(container).toMatchSnapshot();
  });
});
