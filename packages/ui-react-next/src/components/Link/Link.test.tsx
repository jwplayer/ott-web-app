import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import Link from './Link';

describe('<Link>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Link />);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<Link />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
