import React from 'react';
import { render } from '@testing-library/react';

import MenuButton from './MenuButton';

describe('<MenuButton>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<MenuButton label="Label" onClick={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
