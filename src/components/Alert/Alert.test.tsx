import React from 'react';
import { render } from '@testing-library/react';

import Alert from './Alert';

describe('<Alert>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Alert message="Body" open={true} onClose={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
