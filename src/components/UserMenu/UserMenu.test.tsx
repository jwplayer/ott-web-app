import React from 'react';

import UserMenu from './UserMenu';

import { renderWithRouter } from '#test/testUtils';

describe('<UserMenu>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<UserMenu showPaymentsItem={true} />);

    expect(container).toMatchSnapshot();
  });
});
