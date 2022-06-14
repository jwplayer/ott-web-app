import React from 'react';
import { render } from '@testing-library/react';

import ConfirmationDialog from './ConfirmationDialog';

vi.mock('../Dialog/Dialog', () => ({
  default: 'div',
}));

describe('<ConfirmationDialog>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<ConfirmationDialog body="Body" title="Title" open={true} onConfirm={vi.fn()} onClose={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
