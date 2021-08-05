import React from 'react';

import { render } from '../../testUtils';

import UserMenu from './UserMenu';

describe('<UserMenu>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<UserMenu showPaymentsItem={true} />);

    expect(container).toMatchSnapshot();
  });
});
