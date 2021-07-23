import React from 'react';
import { render } from '@testing-library/react';

import CheckoutForm from './CheckoutForm';

describe('<CheckoutForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<CheckoutForm />);

    expect(container).toMatchSnapshot();
  });
});
