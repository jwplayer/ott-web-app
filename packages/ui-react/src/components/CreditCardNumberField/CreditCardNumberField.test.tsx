import React from 'react';
import { render } from '@testing-library/react';

import CreditCardNumberField from './CreditCardNumberField';

describe('<CreditCardNumberField>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<CreditCardNumberField value="" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
