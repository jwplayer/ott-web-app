import React from 'react';
import { render } from '@testing-library/react';

import CollapsibleText from './CollapsibleText';

describe('<CollapsibleText>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<CollapsibleText text="Test..." />);

    expect(container).toMatchSnapshot();
  });
});
