import React from 'react';
import { render } from '@testing-library/react';

import DynamicBlur from './DynamicBlur';

describe('<DynamicBlur>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<DynamicBlur url="/" />);

    expect(container).toMatchSnapshot();
  });
});
