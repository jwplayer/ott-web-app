import React from 'react';
import { render } from '@testing-library/react';

import CreditCardExpiryField from './CreditCardExpiryField';

describe('<CreditCardExpiryField>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<CreditCardExpiryField value="" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
