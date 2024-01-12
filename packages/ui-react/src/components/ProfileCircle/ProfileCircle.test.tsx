import React from 'react';

import { renderWithRouter } from '../../../test/utils';

import ProfileCircle from './ProfileCircle';

describe('<ProfileCircle>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<ProfileCircle src={''} alt={''} />);

    expect(container).toMatchSnapshot();
  });
});
