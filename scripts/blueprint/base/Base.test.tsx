import React from 'react';
import { render } from '@testing-library/react';

import Base from './Base';

describe('<Base>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Base />);

    expect(container).toMatchSnapshot();
  });
});
