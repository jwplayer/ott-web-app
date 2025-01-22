import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import MenuButton from './MenuButton';

describe('<MenuButton>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<MenuButton label="Label" onClick={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<MenuButton label="Label" onClick={vi.fn()} />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
