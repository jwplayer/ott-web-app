import * as React from 'react';
import { fireEvent } from '@testing-library/react';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';

import { renderWithRouter } from '../../../test/utils';

import Card from './Card';

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
    expect(getByAltText('')).toHaveAttribute('src', 'http://movie.jpg?width=320');
  });

  it('makes the image visible after load', () => {
    const { getByAltText } = renderWithRouter(<Card item={itemWithImage} url="https://test.dummy.jwplayer.com" />);
    const image = getByAltText(''); // Image alt is intentionally empty for a11y

    expect(image).toHaveAttribute('src', 'http://movie.jpg?width=320');
    expect(image).toHaveStyle({ opacity: 0 });

    fireEvent.load(image);

    expect(image).toHaveStyle({ opacity: 1 });
  });

  it('should render anchor tag', () => {
    const { container } = renderWithRouter(<Card item={itemWithImage} url="https://test.dummy.jwplayer.com" />);
    expect(container).toMatchSnapshot();
  });
});
