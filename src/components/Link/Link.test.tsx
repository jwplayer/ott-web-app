import React from 'react';
import { render } from '@testing-library/react';

import Link from './Link';

describe('<Link>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Link />);

    expect(container).toMatchSnapshot();
  });
});
