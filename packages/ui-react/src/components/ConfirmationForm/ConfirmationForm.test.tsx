import React from 'react';
import { axe } from 'vitest-axe';

import { renderWithRouter } from '../../../test/utils';

import ConfirmationForm from './ConfirmationForm';

describe('<ConfirmationForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<ConfirmationForm onBackToLogin={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = renderWithRouter(<ConfirmationForm onBackToLogin={vi.fn()} />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
