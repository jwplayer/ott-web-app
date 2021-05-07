import React from 'react';
import { render } from '@testing-library/react';

import Video from './Video';

describe('<Video>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Video />);

    expect(container).toMatchSnapshot();
  });
});
