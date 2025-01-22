import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import FormFeedback from './FormFeedback';

describe('<FormFeedback>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<FormFeedback variant="error">Form feedback</FormFeedback>);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<FormFeedback variant="error">Form feedback</FormFeedback>);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
