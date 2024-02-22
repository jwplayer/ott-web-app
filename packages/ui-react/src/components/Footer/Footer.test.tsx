import React from 'react';
import { render } from '@testing-library/react';

import Footer from './Footer';

describe('<Footer>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Footer text="Simple" />);

    expect(container).toMatchSnapshot();
  });
  test('renders and matches snapshot without links', () => {
    const { container } = render(<Footer text="Text one | Text two" />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot with two links', () => {
    const { container } = render(<Footer text="Two links | [jwplayer.com](https://www.jwplayer.com/) | [jwplayer.com](https://www.jwplayer.com/)" />);

    expect(container).toMatchSnapshot();
  });
});
