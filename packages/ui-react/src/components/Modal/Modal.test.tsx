import React, { act } from 'react';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { renderWithRouter } from '../../../test/utils';

import Modal from './Modal';

describe('<Modal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <Modal open={true} onClose={vi.fn()}>
        <p>Test modal</p>
      </Modal>,
    );

    expect(container).toMatchSnapshot();
  });

  test('add overflowY hidden on the body element when open', async () => {
    const onClose = vi.fn();
    const { container, rerender } = await act(() => renderWithRouter(<Modal open={true} onClose={onClose} />));
    vi.useFakeTimers();

    expect(container.parentNode).toHaveStyle({ overflowY: 'hidden' });

    act(() => {
      rerender(<Modal open={false} onClose={onClose} />);
    });

    await act(() => vi.runAllTimers()); // wait for close animation
    vi.useRealTimers();

    expect(onClose).toHaveBeenCalled();
    expect(container.parentNode).not.toHaveStyle({ overflowY: 'hidden' });
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    vi.useRealTimers(); // Use real timers for this specific test
    const { container } = render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Test modal</p>
      </Modal>,
    );

    await act(async () => {
      expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
    });
  });
});
