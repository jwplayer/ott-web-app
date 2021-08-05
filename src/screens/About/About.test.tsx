import React from 'react';
import { render } from '@testing-library/react';

import About from './About';

describe('<About>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<About />);

    expect(container).toMatchSnapshot();
  });
});
