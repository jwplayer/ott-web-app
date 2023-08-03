import * as React from 'react';
import { fireEvent } from '@testing-library/react';

import Card from './Card';

import type { PlaylistItem } from '#types/playlist';
import { renderWithRouter } from '#test/testUtils';

const item = { title: 'aa', duration: 120 } as PlaylistItem;
const itemWithImage = { title: 'This is a movie', duration: 120, cardImage: 'http://movie.jpg' } as PlaylistItem;

describe('<Card>', () => {
  it('renders card with video title', () => {
    const { getByText } = renderWithRouter(<Card item={item} url="https://test.dummy.jwplayer.com" />);
    expect(getByText(/aa/i)).toBeTruthy();
  });

  it('renders tag with correct duration', () => {
    const { getByText } = renderWithRouter(<Card item={item} url="https://test.dummy.jwplayer.com" />);
    expect(getByText(/2/i)).toBeTruthy();
  });

  it('renders the image with the image prop when valid', () => {
    const { getByAltText } = renderWithRouter(<Card item={itemWithImage} url="https://test.dummy.jwplayer.com" />);
    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://movie.jpg?width=320');
  });

  it('makes the image visible after load', () => {
    const { getByAltText } = renderWithRouter(<Card item={itemWithImage} url="https://test.dummy.jwplayer.com" />);

    expect(getByAltText('This is a movie')).toHaveAttribute('src', 'http://movie.jpg?width=320');
    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 0 });

    fireEvent.load(getByAltText('This is a movie'));

    expect(getByAltText('This is a movie')).toHaveStyle({ opacity: 1 });
  });

  it('should render anchor tag', () => {
    const { container } = renderWithRouter(<Card item={itemWithImage} url="https://test.dummy.jwplayer.com" />);
    expect(container).toMatchSnapshot();
  });
});
