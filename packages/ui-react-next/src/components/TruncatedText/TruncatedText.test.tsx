import React from 'react';
import { render } from '@testing-library/react';

import TruncatedText from './TruncatedText';

describe('<TruncatedText>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<TruncatedText text="Test..." maximumLines={8} />);

    expect(container).toMatchSnapshot();
  });
});
