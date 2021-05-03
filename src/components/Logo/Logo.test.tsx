import React from 'react';

import { render } from '../../testUtils';

import Logo from './Logo';

describe('<Logo/>', () => {
  it('renders and matches snapshot', () => {
    const { container } = render(<Logo src="123" />);

    expect(container).toMatchSnapshot();
  });
});
