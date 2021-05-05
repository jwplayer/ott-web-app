import React from 'react';

import { render } from '../../testUtils';
import ButtonLink from '../ButtonLink/ButtonLink';

import SideBar from './SideBar';

describe('<SideBar />', () => {
  const playlistMenuItems = [<ButtonLink key="key" label="Home" to="/" />];
  test('renders sideBar', () => {
    const { container } = render(
      <SideBar
        isOpen={true}
        onClose={jest.fn()}
        playlistMenuItems={playlistMenuItems}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
