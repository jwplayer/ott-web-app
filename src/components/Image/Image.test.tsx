import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Image from './Image';

describe('<Image>', () => {
  test('uses the src attribute when valid', () => {
    const { getByAltText } = render(<Image image={{ image: 'http://image.jpg' }} alt="image" />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://image.jpg?width=640');
  });

  test('tries the fallbackSrc when the image fails to load', () => {
    const { getByAltText } = render(
      <Image
        image={{
          image: 'http://image.jpg',
          fallbackImage: 'http://fallback.jpg',
        }}
        alt="image"
      />,
    );

    fireEvent.error(getByAltText('image'));

    expect(getByAltText('image')).toHaveAttribute('src', 'http://fallback.jpg?width=640');
  });

  test('updates the src attribute when changed', () => {
    const { getByAltText, rerender } = render(<Image image={{ image: 'http://image.jpg' }} alt="image" />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://image.jpg?width=640');

    rerender(<Image image={{ image: 'http://otherimage.jpg' }} alt="image" />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://otherimage.jpg?width=640');
  });

  test('updates the src attribute when changed with the fallback image', () => {
    const { getByAltText, rerender } = render(<Image image={{ image: 'http://image.jpg' }} alt="image" />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://image.jpg?width=640');

    rerender(
      <Image
        image={{
          image: 'http://otherimage.jpg',
          fallbackImage: 'http://otherfallback.jpg',
        }}
        alt="image"
      />,
    );

    fireEvent.error(getByAltText('image'));

    expect(getByAltText('image')).toHaveAttribute('src', 'http://otherfallback.jpg?width=640');
  });

  test('fires the onLoad callback when the image is loaded', () => {
    const onLoad = vi.fn();
    const { getByAltText } = render(<Image image={{ image: 'http://image.jpg' }} alt="image" onLoad={onLoad} />);

    fireEvent.load(getByAltText('image'));

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  test('fires the onLoad callback when the fallback image is loaded', () => {
    const onLoad = vi.fn();
    const { getByAltText } = render(
      <Image
        image={{
          image: 'http://image.jpg',
          fallbackImage: 'http://fallback.jpg',
        }}
        alt="image"
        onLoad={onLoad}
      />,
    );

    fireEvent.error(getByAltText('image'));
    fireEvent.load(getByAltText('image'));

    expect(getByAltText('image')).toHaveAttribute('src', 'http://fallback.jpg?width=640');
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  test('changes the image width based on the given width', () => {
    const { getByAltText } = render(
      <Image
        image={{
          image: 'http://image.jpg',
          fallbackImage: 'http://fallback.jpg',
        }}
        alt="image"
        width={1280}
      />,
    );

    expect(getByAltText('image')).toHaveAttribute('src', 'http://image.jpg?width=1280');
  });
});
