import React from 'react';
import { render } from '@testing-library/react';

import Radio from './Radio';

describe('<Radio>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Radio name="radio" onChange={jest.fn()} value="value" />);

    expect(container).toMatchSnapshot();
  });
});
