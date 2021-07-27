import React from 'react';
import { render } from '@testing-library/react';

import Radio from './Radio';

describe.skip('<Radio>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Radio />);

    expect(container).toMatchSnapshot();
  });
});
