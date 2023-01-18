import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import VideoDetails from './VideoDetails';

describe('<VideoDetails>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <VideoDetails
        title="Test video"
        description="Video description"
        primaryMetadata="Primary metadata string"
        secondaryMetadata={<strong>Secondary metadata string</strong>}
        image={{ image: 'http://image.jpg' }}
        startWatchingButton={<button>Start watching</button>}
        shareButton={<button>share</button>}
        favoriteButton={<button>favorite</button>}
        trailerButton={<button>play trailer</button>}
      />,
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
        image={{ image: 'http://image.jpg' }}
        startWatchingButton={<button>Start watching</button>}
        shareButton={<button>share</button>}
        favoriteButton={<button>favorite</button>}
        trailerButton={<button>play trailer</button>}
      />,
    );

    expect(getByAltText('Test video')).toHaveAttribute('src', 'http://image.jpg?width=1280');
  });

  test('renders the fallback image when the image fails to load', () => {
    const { getByAltText } = render(
      <VideoDetails
        title="Test video"
        description="Video description"
        primaryMetadata="Primary metadata string"
        secondaryMetadata={<strong>Secondary metadata string</strong>}
        image={{ image: 'http://image.jpg', fallbackImage: 'http://fallback.jpg' }}
        startWatchingButton={<button>Start watching</button>}
        shareButton={<button>share</button>}
        favoriteButton={<button>favorite</button>}
        trailerButton={<button>play trailer</button>}
      />,
    );

    expect(getByAltText('Test video')).toHaveAttribute('src', 'http://image.jpg?width=1280');

    fireEvent.error(getByAltText('Test video'));

    expect(getByAltText('Test video')).toHaveAttribute('src', 'http://fallback.jpg?width=1280');
  });
});
