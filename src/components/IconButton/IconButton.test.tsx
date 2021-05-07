import React from 'react';
import { render } from '@testing-library/react';

import Close from '../../icons/Close';

import IconButton from './IconButton';

describe('<IconButton>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <IconButton aria-label="Icon button" onClick={jest.fn()}>
        <Close />
      </IconButton>,
    );

    expect(container).toMatchSnapshot();
  });
});
