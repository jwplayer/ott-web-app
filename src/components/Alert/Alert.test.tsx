import React from 'react';
import { render } from '@testing-library/react';

import Alert from './Alert';

describe('<Alert>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Alert body="Body" title="Title" open={true} onClose={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
