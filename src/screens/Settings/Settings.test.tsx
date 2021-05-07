import React from 'react';
import { render } from '@testing-library/react';

import Settings from './Settings';

describe('<Settings>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Settings />);

    expect(container).toMatchSnapshot();
  });
});
