import React from 'react';
import { render } from '@testing-library/react';

import CancelSubscriptionForm from './CancelSubscriptionForm';

describe('<CancelSubscriptionForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<CancelSubscriptionForm submitting={false} error={null} onCancel={vi.fn()} onConfirm={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
