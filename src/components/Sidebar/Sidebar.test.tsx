import React from 'react';
import { renderWithRouter } from 'test/testUtils';
import Button from 'src/components/Button/Button';

import Sidebar from './Sidebar';

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
