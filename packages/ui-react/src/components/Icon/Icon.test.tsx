import React from 'react';
import { render } from '@testing-library/react';

import Icon from './Icon';

describe('<Icon>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Icon icon={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
