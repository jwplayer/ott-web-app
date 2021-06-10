import React from 'react';

import Button from '../Button/Button';
import { render } from '../../testUtils';

import Header from './Header';

describe('<Header />', () => {
  test('renders header', () => {
    const playlistMenuItems = [<Button key="key" label="Home" to="/" />];
    const { container } = render(<Header onMenuButtonClick={jest.fn()}>{playlistMenuItems}</Header>);

    expect(container).toMatchSnapshot();
  });
});
