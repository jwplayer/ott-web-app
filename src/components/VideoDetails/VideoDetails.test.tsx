import React from 'react';
import { render } from '@testing-library/react';

import VideoDetails from './VideoDetails';

describe('<VideoDetails>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <VideoDetails
        title="Test video"
        description="Video description"
        videoMeta="Video meta"
        poster="posterimage"
        posterMode="fading"
        hasTrailer={true}
        isFavorite={false}
        isFavoritesEnabled={true}
        onFavoriteButtonClick={vi.fn()}
        playTrailer={false}
        onTrailerClick={vi.fn()}
        onTrailerClose={vi.fn()}
        startWatchingButton={<button>Start watching</button>}
        shareButton={<button>share</button>}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
