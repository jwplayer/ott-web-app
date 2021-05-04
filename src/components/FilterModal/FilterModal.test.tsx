import React from 'react';
import { render } from '@testing-library/react';

import FilterModal from './FilterModal';

describe('<FilterModal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<FilterModal />);

    expect(container).toMatchSnapshot();
  });
});
