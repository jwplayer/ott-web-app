import React from 'react';

import AccountModal from './AccountModal';

import { renderWithRouter } from '#test/testUtils';

describe('<AccountModal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<AccountModal />);

    expect(container).toMatchSnapshot();
  });
});
