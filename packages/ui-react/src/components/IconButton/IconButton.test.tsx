import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';
import Close from '@jwp/ott-theme/assets/icons/close.svg?react';

import IconButton from './IconButton';

describe('<IconButton>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <IconButton aria-label="Icon button" onClick={vi.fn()}>
        <Close />
      </IconButton>,
    );

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(
      <IconButton aria-label="Icon button" onClick={vi.fn()}>
        <Close />
      </IconButton>,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
