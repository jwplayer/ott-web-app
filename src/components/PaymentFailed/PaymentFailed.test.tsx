import React from 'react';
import { render } from '@testing-library/react';

import PaymentFailed from './PaymentFailed';

describe('<PaymentFailed>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<PaymentFailed type="error" onCloseButtonClick={jest.fn()} message="Error message" />);

    expect(container).toMatchSnapshot();
  });
});
