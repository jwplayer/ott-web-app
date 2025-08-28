import React from 'react';
import { render } from '@testing-library/react';

import ModalCloseButton from './ModalCloseButton';

describe('<ModalCloseButton>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<ModalCloseButton />);

    expect(container).toMatchSnapshot();
  });
});
