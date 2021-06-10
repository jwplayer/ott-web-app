import React from 'react';

import Button from '../Button/Button';
import { render } from '../../testUtils';

import Sidebar from './Sidebar';

describe('<SideBar />', () => {
  const playlistMenuItems = [<Button key="key" label="Home" to="/" />];
  test('renders sideBar', () => {
    const { container } = render(
      <Sidebar isOpen={true} onClose={jest.fn()}>
        {playlistMenuItems}
      </Sidebar>,
    );

    expect(container).toMatchSnapshot();
  });
});
