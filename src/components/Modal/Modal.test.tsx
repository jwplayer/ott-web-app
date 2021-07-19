import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Modal from './Modal';

describe('<Modal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <Modal open={true} onClose={jest.fn()}>
        <p>Test modal</p>
      </Modal>,
    );

    expect(container).toMatchSnapshot();
  });

  test('calls the onClose function when clicking the backdrop', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<Modal open={true} onClose={onClose} />);

    fireEvent.click(getByTestId('backdrop'));

    expect(onClose).toBeCalledTimes(1);
  });

  test('calls the onClose function when clicking the close icon', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(<Modal open={true} onClose={onClose} closeButtonVisible />);

    fireEvent.click(getByLabelText('close_modal'));

    expect(onClose).toBeCalledTimes(1);
  });

  test('should add aria-hidden and inert attributes on the root div when open', () => {
    const onClose = jest.fn();
    const { getByTestId, rerender } = render(
      <div id="root" data-testid="root">
        <Modal open={true} onClose={onClose} closeButtonVisible />
      </div>,
    );

    expect(getByTestId('root')).toHaveAttribute('aria-hidden', 'true');
    expect(getByTestId('root')).toHaveProperty('inert', true);

    rerender(
      <div id="root" data-testid="root">
        <Modal open={false} onClose={onClose} closeButtonVisible />
      </div>,
    );

    expect(getByTestId('root')).not.toHaveAttribute('aria-hidden', 'true');
    expect(getByTestId('root')).toHaveProperty('inert', false);
  });

  test('should add overflowY hidden on the body element when open', () => {
    const onClose = jest.fn();
    const { container, rerender } = render(<Modal open={true} onClose={onClose} closeButtonVisible />);

    expect(container.parentNode).toHaveStyle({ overflowY: 'hidden' });

    rerender(<Modal open={false} onClose={onClose} closeButtonVisible />);

    expect(container.parentNode).not.toHaveStyle({ overflowY: 'hidden' });
  });
});
