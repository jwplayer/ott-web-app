import React from 'react';

import { render } from '../../testUtils';
import ButtonLink from '../ButtonLink/ButtonLink';

import Header from './Header';

describe('<Header />', () => {
  test('renders header', () => {
    const playlistMenuItems = [<ButtonLink key="key" label="Home" to="/" />];
    const { container } = render(
      <Header
        onMenuButtonClick={jest.fn()}
        playlistMenuItems={playlistMenuItems}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
