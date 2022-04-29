import React from 'react';
import { renderWithRouter } from 'test/testUtils';

import UserMenu from './UserMenu';

describe('<UserMenu>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<UserMenu showPaymentsItem={true} />);

    expect(container).toMatchSnapshot();
  });
});
