import React from 'react';

import DevTools from './DevTools';

import { renderWithRouter } from '#test/testUtils';

describe('<ConfigSelect>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<DevTools />);

    expect(container).toMatchSnapshot();
  });
});
