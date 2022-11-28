import React from 'react';

import Sidebar from './Sidebar';

import { renderWithRouter } from '#test/testUtils';
import Button from '#components/Button/Button';

describe('<SideBar />', () => {
  const playlistMenuItems = [<Button key="key" label="Home" to="/" />];

  test('renders sideBar', () => {
    const { container } = renderWithRouter(
      <Sidebar isOpen={true} onClose={vi.fn()}>
        {playlistMenuItems}
      </Sidebar>,
    );

    expect(container).toMatchSnapshot();
  });
});
