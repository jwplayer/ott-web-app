import React from 'react';
import { render } from '@testing-library/react';

import Dialog from './Dialog';

describe('<Dialog>', () => {
  test('renders and matches snapshot', () => {
    const { baseElement } = render(
      <>
        <span>Some content</span>
        <Dialog onClose={vi.fn()} open={true}>
          Dialog contents
        </Dialog>
        <span>Some other content</span>
      </>,
    );

    expect(baseElement).toMatchSnapshot();
  });
});
