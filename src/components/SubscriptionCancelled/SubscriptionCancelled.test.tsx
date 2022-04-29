import React from 'react';
import { render } from '@testing-library/react';

import SubscriptionCancelled from './SubscriptionCancelled';

describe('<SubscriptionCancelled>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<SubscriptionCancelled onClose={vi.fn()} expiresDate="12/12/2021" />);

    expect(container).toMatchSnapshot();
  });
});
