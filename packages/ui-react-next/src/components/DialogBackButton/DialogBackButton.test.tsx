import React from 'react';
import { render } from '@testing-library/react';

import DialogBackButton from './DialogBackButton';

describe('<DialogBackButton>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<DialogBackButton />);

    expect(container).toMatchSnapshot();
  });
});
