import React from 'react';
import { render } from '@testing-library/react';

import Series from './Series';

describe('<Series>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Series />);

    expect(container).toMatchSnapshot();
  });
});
