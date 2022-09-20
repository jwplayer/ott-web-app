import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Image from './Image';

describe('<Image>', () => {
  test('uses the src attribute when valid', () => {
    const { getByAltText } = render(<Image src="http://image.jpg" alt="image" />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://image.jpg');
  });

  test('tries the fallbackSrc when the image fails to load', () => {
    const { getByAltText } = render(<Image src="http://image.jpg" fallbackSrc="http://fallback.jpg" alt="image" />);

    fireEvent.error(getByAltText('image'));

    expect(getByAltText('image')).toHaveAttribute('src', 'http://fallback.jpg');
  });

  test('updates the src attribute when changed', () => {
    const { getByAltText, rerender } = render(<Image src="http://image.jpg" alt="image" />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://image.jpg');

    rerender(<Image src="http://otherimage.jpg" alt="image" />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://otherimage.jpg');
  });

  test('updates the src attribute when changed with the fallback image', () => {
    const { getByAltText, rerender } = render(<Image src="http://image.jpg" alt="image" />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://image.jpg');

    rerender(<Image src="http://otherimage.jpg" fallbackSrc="http://otherfallback.jpg" alt="image" />);

    fireEvent.error(getByAltText('image'));

    expect(getByAltText('image')).toHaveAttribute('src', 'http://otherfallback.jpg');
  });

  test('fires the onLoad callback when the image is loaded', () => {
    const onLoad = vi.fn();
    const { getByAltText } = render(<Image src="http://image.jpg" alt="image" onLoad={onLoad} />);

    fireEvent.load(getByAltText('image'));

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  test('fires the onLoad callback when the fallback image is loaded', () => {
    const onLoad = vi.fn();
    const { getByAltText } = render(<Image src="http://image.jpg" fallbackSrc="http://fallback.jpg" alt="image" onLoad={onLoad} />);

    fireEvent.error(getByAltText('image'));
    fireEvent.load(getByAltText('image'));

    expect(getByAltText('image')).toHaveAttribute('src', 'http://fallback.jpg');
    expect(onLoad).toHaveBeenCalledTimes(1);
  });
});
