import React from 'react';
import { render } from '@testing-library/react';

import Dialog from './Dialog';

describe('<Dialog>', () => {
  test('renders and matches snapshot', () => {
    const { baseElement } = render(
      <>
        <span>Some content</span>
        <Dialog onClose={vi.fn()} open={true} role="dialog">
          Dialog contents
        </Dialog>
        <span>Some other content</span>
      </>,
    );

    expect(baseElement).toMatchSnapshot();
  });

  test('Should ensure Dialog is properly marked as a modal and has role "dialog"', () => {
    const { getByTestId } = render(
      <>
        <span>Some content</span>
        <Dialog onClose={vi.fn()} open={true} role="dialog" data-testid="dialog">
          Dialog contents
        </Dialog>
        <span>Some other content</span>
      </>,
    );

    const dialogElement = getByTestId('dialog');

    expect(dialogElement).toHaveAttribute('aria-modal', 'true');
    expect(dialogElement).toHaveAttribute('role', 'dialog');
  });
});
