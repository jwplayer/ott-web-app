import React from 'react';

import { render } from '../../testUtils';

import AccountModal from './AccountModal';

describe('<AccountModal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<AccountModal />);

    expect(container).toMatchSnapshot();
  });
});
