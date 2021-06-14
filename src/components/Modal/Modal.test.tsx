import React from 'react';
import { render } from '@testing-library/react';

import Modal from './Modal';

describe('<Modal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Modal />);

    expect(container).toMatchSnapshot();
  });
});
