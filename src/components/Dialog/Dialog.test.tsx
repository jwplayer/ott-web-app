import React from 'react';
import { render } from '@testing-library/react';

import Dialog from './Dialog';

vi.mock('../Modal/Modal', () => ({
  default: 'div',
}));

describe('<Dialog>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <Dialog onClose={vi.fn()} open>
        Dialog contents
      </Dialog>,
    );

    expect(container).toMatchSnapshot();
  });
});
