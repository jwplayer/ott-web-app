import React from 'react';
import { render } from '@testing-library/react';

import Alert from './Alert';

vi.mock('../Dialog/Dialog', () => ({
  default: 'div',
}));

describe('<Alert>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Alert body="Body" title="Title" open={true} onClose={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
