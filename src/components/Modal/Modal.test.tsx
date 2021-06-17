import React from 'react';
import { render } from '@testing-library/react';

import Modal from './Modal';

describe('<Modal>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <Modal onClose={jest.fn()}>
        <p>Test modal</p>
      </Modal>,
    );

    expect(container).toMatchSnapshot();
  });
});
