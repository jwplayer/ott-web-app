import React from 'react';
import { render } from '@testing-library/react';

import Checkbox from './Checkbox';

describe('<Checkbox>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Checkbox name="abc" value={false} onChange={(e) => e} />);

    expect(container).toMatchSnapshot();
  });
});
