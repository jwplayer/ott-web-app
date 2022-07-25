import React from 'react';
import { render } from '@testing-library/react';

import VideoDetails from './VideoDetails';

describe('<VideoDetails>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <VideoDetails
        title="Test video"
        description="Video description"
        primaryMetadata="Primary metadata string"
        secondaryMetadata={<strong>Secondary metadata string</strong>}
        poster="posterimage"
        posterMode="fading"
        startWatchingButton={<button>Start watching</button>}
        shareButton={<button>share</button>}
        favoriteButton={<button>favorite</button>}
        trailerButton={<button>play trailer</button>}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
