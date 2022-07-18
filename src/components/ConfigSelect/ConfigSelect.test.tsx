import React from 'react';

import ConfigSelect from './';

import { renderWithRouter } from '#test/testUtils';

describe('<ConfigSelect>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<ConfigSelect />);

    expect(container).toMatchSnapshot();
  });
});
