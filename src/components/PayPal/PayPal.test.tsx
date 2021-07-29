import React from 'react';
import { render } from '@testing-library/react';

import PayPal from './PayPal';

describe('<PayPal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<PayPal />);

    expect(container).toMatchSnapshot();
  });
});
