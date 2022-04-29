import React from 'react';
import { renderWithRouter } from 'test/testUtils';

import AccountModal from './AccountModal';

describe('<AccountModal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<AccountModal />);

    expect(container).toMatchSnapshot();
  });
});
