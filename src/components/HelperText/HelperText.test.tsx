import React from 'react';
import { render } from '@testing-library/react';

import HelperText from './HelperText';

describe('<HelperText>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<HelperText error={true}>Hello world!</HelperText>);

    expect(container).toMatchSnapshot();
  });
});
