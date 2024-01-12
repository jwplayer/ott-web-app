import React from 'react';
import { render } from '@testing-library/react';
import Close from '@jwp/ott-theme/assets/icons/close.svg?react';

import IconButton from './IconButton';

describe('<IconButton>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <IconButton aria-label="Icon button" onClick={vi.fn()}>
        <Close />
      </IconButton>,
    );

    expect(container).toMatchSnapshot();
  });
});
