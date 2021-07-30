import React from 'react';
import { render } from '@testing-library/react';

import PasswordStrength from './PasswordStrength';

describe('<PasswordStrength>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<PasswordStrength password="Welcome03" />);

    expect(container).toMatchSnapshot();
  });
});
