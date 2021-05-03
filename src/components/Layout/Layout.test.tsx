import React from 'react';

import { render } from '../../testUtils';

import Layout from './Layout';

describe('<Layout />', () => {
  test('renders layout', () => {
    const { container } = render(<Layout />);

    expect(container).toMatchSnapshot();
  });
});
