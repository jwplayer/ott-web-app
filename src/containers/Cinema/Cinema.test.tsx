import React from 'react';
import { render } from '@testing-library/react';

import Cinema from './Cinema';

describe('<Cinema>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Cinema />);

    expect(container).toMatchSnapshot();
  });
});
