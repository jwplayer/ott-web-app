import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Card from './Card';

describe('<Card>', () => {
  it('renders card with video title', () => {
    const { getByText } = render(<Card title="aa" duration={120} onClick={() => ''} />);
    expect(getByText(/aa/i)).toBeTruthy();
  });

  it('renders tag with correct duration', () => {
    const { getByText } = render(<Card title="aa" duration={120} onClick={() => ''} />);
    expect(getByText(/2/i)).toBeTruthy();
  });

  it('renders the image with the image prop when valid', () => {
    const { getByAltText } = render(<Card title="This is a movie" duration={120} onClick={() => ''} image={{ image: 'http://movie.jpg' }} />);

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://movie.jpg?width=320');
  });

  it('makes the image visible after load', () => {
    const { getByAltText } = render(<Card title="This is a movie" duration={120} onClick={() => ''} image={{ image: 'http://movie.jpg' }} />);

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://movie.jpg?width=320');
    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 0 });

    fireEvent.load(getByAltText('This is a movie'));

    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 1 });
  });

  it('uses the fallback image when the image fails to load', () => {
    const { getByAltText } = render(
      <Card
        title="This is a movie"
        duration={120}
        onClick={() => ''}
        image={{
          image: 'http://movie.jpg',
          fallbackImage: 'http://fallback.jpg',
        }}
      />,
    );

    fireEvent.error(getByAltText('This is a movie'));

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://fallback.jpg?width=320');
    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 0 });

    fireEvent.load(getByAltText('This is a movie'));

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://fallback.jpg?width=320');
    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 1 });
  });
});
