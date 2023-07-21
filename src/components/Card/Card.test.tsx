import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Card from './Card';

import type { PlaylistItem } from '#types/playlist';

const item = { title: 'aa', duration: 120 } as PlaylistItem;
const itemWithImage = { title: 'This is a movie', duration: 120, shelfImage: { image: 'http://movie.jpg' } } as PlaylistItem;

describe('<Card>', () => {
  it('renders card with video title', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Card item={item} onClick={() => ''} />
      </BrowserRouter>,
    );
    expect(getByText(/aa/i)).toBeTruthy();
  });

  it('renders tag with correct duration', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Card item={item} onClick={() => ''} />
      </BrowserRouter>,
    );
    expect(getByText(/2/i)).toBeTruthy();
  });

  it('renders the image with the image prop when valid', () => {
    const { getByAltText } = render(
      <BrowserRouter>
        <Card item={itemWithImage} onClick={() => ''} />
      </BrowserRouter>,
    );

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://movie.jpg?width=320');
  });

  it('makes the image visible after load', () => {
    const { getByAltText } = render(
      <BrowserRouter>
        <Card item={itemWithImage} onClick={() => ''} />
      </BrowserRouter>,
    );

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://movie.jpg?width=320');
    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 0 });

    fireEvent.load(getByAltText('This is a movie'));

    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 1 });
  });

  it('uses the fallback image when the image fails to load', () => {
    const itemWithFallbackImage = {
      title: 'This is a movie',
      duration: 120,
      shelfImage: {
        image: 'http://movie.jpg',
        fallbackImage: 'http://fallback.jpg',
      },
    } as PlaylistItem;

    const { getByAltText } = render(
      <BrowserRouter>
        <Card item={itemWithFallbackImage} onClick={() => ''} />
      </BrowserRouter>,
    );

    fireEvent.error(getByAltText('This is a movie'));

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://fallback.jpg?width=320');
    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 0 });

    fireEvent.load(getByAltText('This is a movie'));

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://fallback.jpg?width=320');
    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 1 });
  });
});
