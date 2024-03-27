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
        image="http://image.jpg"
        startWatchingButton={<button>Start watching</button>}
        shareButton={<button>share</button>}
        favoriteButton={<button>favorite</button>}
        trailerButton={<button>play trailer</button>}
      >
        <div>Related Videos</div>
      </VideoDetails>,
    );

    expect(container).toMatchSnapshot();
  });

  test('renders the image', () => {
    const { getByAltText } = render(
      <VideoDetails
        title="Test video"
        description="Video description"
        primaryMetadata="Primary metadata string"
        secondaryMetadata={<strong>Secondary metadata string</strong>}
        image="http://image.jpg"
        startWatchingButton={<button>Start watching</button>}
        shareButton={<button>share</button>}
        favoriteButton={<button>favorite</button>}
        trailerButton={<button>play trailer</button>}
      >
        <div>Related Videos</div>
      </VideoDetails>,
    );

    const image = getByAltText(''); // Image alt is intentionally empty for a11y;
    expect(image).toHaveAttribute('src', 'http://image.jpg?width=1280');
  });
});
