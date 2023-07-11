import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Card from './Card';

import type { PlaylistItem } from '#types/playlist';

const item = { title: 'aa', duration: 120 } as PlaylistItem;
const itemWithImage = { title: 'This is a movie', duration: 120, cardImage: 'http://movie.jpg' } as PlaylistItem;

describe('<Card>', () => {
  it('renders card with video title', () => {
    const { getByText } = render(<Card item={item} onClick={() => ''} />);
    expect(getByText(/aa/i)).toBeTruthy();
  });

  it('renders tag with correct duration', () => {
    const { getByText } = render(<Card item={item} onClick={() => ''} />);
    expect(getByText(/2/i)).toBeTruthy();
  });

  it('renders the image with the image prop when valid', () => {
    const { getByAltText } = render(<Card item={itemWithImage} onClick={() => ''} />);

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://movie.jpg?width=320');
  });

  it('makes the image visible after load', () => {
    const { getByAltText } = render(<Card item={itemWithImage} onClick={() => ''} />);

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://movie.jpg?width=320');
    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 0 });

    fireEvent.load(getByAltText('This is a movie'));

    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 1 });
  });
});
