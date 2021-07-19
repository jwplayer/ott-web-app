import React from 'react';
import { render } from '@testing-library/react';

import AccountModal from './AccountModal';

describe('<AccountModal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<AccountModal />);

    expect(container).toMatchSnapshot();
  });
});
