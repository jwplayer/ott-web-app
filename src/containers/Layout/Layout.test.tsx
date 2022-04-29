import React from 'react';
import { renderWithRouter } from 'test/testUtils';

import Layout from './Layout';

describe('<Layout />', () => {
  test('renders layout', () => {
    const { container } = renderWithRouter(<Layout />);

    expect(container).toMatchSnapshot();
  });
});
