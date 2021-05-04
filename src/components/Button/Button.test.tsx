import React from 'react';
import { render } from '@testing-library/react';

import Button from './Button';

describe('<Button>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Button />);

    expect(container).toMatchSnapshot();
  });
});
