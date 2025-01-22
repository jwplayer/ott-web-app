import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import PasswordStrength from './PasswordStrength';

describe('<PasswordStrength>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<PasswordStrength password="Welcome03" />);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<PasswordStrength password="Welcome03" />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
