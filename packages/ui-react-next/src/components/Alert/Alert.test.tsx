import React, { act } from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import { renderWithRouter } from '../../../test/utils';

import Alert from './Alert';

describe('<Alert>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<Alert message="Body" open={true} onClose={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<Alert message="Body" open={true} onClose={vi.fn()} />);

    await act(async () => {
      expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
    });
  });
});
