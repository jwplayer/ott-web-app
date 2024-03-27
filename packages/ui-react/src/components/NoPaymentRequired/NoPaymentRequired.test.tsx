import React from 'react';
import { render } from '@testing-library/react';

import NoPaymentRequired from './NoPaymentRequired';

describe('<NoPaymentRequired>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<NoPaymentRequired error={null} onSubmit={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
