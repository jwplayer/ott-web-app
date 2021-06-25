import React from 'react';
import { fireEvent } from '@testing-library/react';

import { render } from '../../testUtils';

import Logo from './Logo';

describe('<Logo/>', () => {
  it('renders and matches snapshot', () => {
    const { container } = render(<Logo src="123" onLoad={jest.fn()} />);

    expect(container).toMatchSnapshot();
  });

  it('calls the onLoad function after the image has been loaded', () => {
    const onLoad = jest.fn();
    const { getByAltText } = render(<Logo src="testimage" onLoad={onLoad} />);

    fireEvent.load(getByAltText('logo'));

    expect(onLoad).toBeCalledTimes(1);
  });

  it('calls the onLoad function when the image fails to load', () => {
    const onLoad = jest.fn();
    const { getByAltText } = render(<Logo src="testimage" onLoad={onLoad} />);

    fireEvent.error(getByAltText('logo'));

    expect(onLoad).toBeCalledTimes(1);
  });
});
