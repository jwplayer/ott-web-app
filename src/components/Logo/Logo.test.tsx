import React from 'react';
import { fireEvent } from '@testing-library/react';

import Logo from './Logo';

import { renderWithRouter } from '#test/testUtils';

describe('<Logo/>', () => {
  it('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<Logo src="123" onLoad={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  it('calls the onLoad function after the image has been loaded', () => {
    const onLoad = vi.fn();
    const { getByAltText } = renderWithRouter(<Logo src="testimage" onLoad={onLoad} />);

    fireEvent.load(getByAltText('logo'));

    expect(onLoad).toBeCalledTimes(1);
  });

  it('calls the onLoad function when the image fails to load', () => {
    const onLoad = vi.fn();
    const { getByAltText } = renderWithRouter(<Logo src="testimage" onLoad={onLoad} />);

    fireEvent.error(getByAltText('logo'));

    expect(onLoad).toBeCalledTimes(1);
  });
});
