import React, { act } from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import { renderWithRouter } from '../../../test/utils';

import ConfirmationDialog from './ConfirmationDialog';

describe('<ConfirmationDialog>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<ConfirmationDialog body="Body" title="Title" open={true} onConfirm={vi.fn()} onClose={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<ConfirmationDialog body="Body" title="Title" open={true} onConfirm={vi.fn()} onClose={vi.fn()} />);

    await act(async () => {
      expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
    });
  });
});
