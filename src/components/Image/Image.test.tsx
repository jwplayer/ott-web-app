import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Image from './Image';

describe('<Image>', () => {
  test('uses the src attribute when valid', () => {
    const { getByAltText } = render(<Image image="http://image.jpg" alt="image" />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://image.jpg?width=640');
  });

  test('fires the onLoad callback when the image is loaded', () => {
    const onLoad = vi.fn();
    const { getByAltText } = render(<Image image="http://image.jpg" alt="image" onLoad={onLoad} />);

    fireEvent.load(getByAltText('image'));

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  test('changes the image width based on the given width', () => {
    const { getByAltText } = render(<Image image="http://image.jpg" alt="image" width={1280} />);

    expect(getByAltText('image')).toHaveAttribute('src', 'http://image.jpg?width=1280');
  });
});
