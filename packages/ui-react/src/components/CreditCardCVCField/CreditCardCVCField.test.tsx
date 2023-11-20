import React from 'react';
import { render } from '@testing-library/react';

import CreditCardCVCField from './CreditCardCVCField';

describe('<CreditCardCVCField>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<CreditCardCVCField value="" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
