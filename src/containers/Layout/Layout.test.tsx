import React from 'react';

import Layout from './Layout';

import { renderWithRouter } from '#test/testUtils';

describe('<Layout />', () => {
  test('renders layout', () => {
    const { container } = renderWithRouter(<Layout />);

    expect(container).toMatchSnapshot();
  });
});
