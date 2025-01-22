import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import CollapsibleText from './CollapsibleText';

describe('<CollapsibleText>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<CollapsibleText text="Test..." />);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<CollapsibleText text="Test..." />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
