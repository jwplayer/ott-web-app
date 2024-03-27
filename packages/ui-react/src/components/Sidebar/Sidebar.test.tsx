import React from 'react';

import { renderWithRouter } from '../../../test/utils';
import Button from '../Button/Button';

import Sidebar from './Sidebar';

describe('<SideBar />', () => {
  const playlistMenuItems = [<Button key="key" label="Home" to="/" />];

  test('renders sideBar opened', () => {
    const { container } = renderWithRouter(
      <Sidebar isOpen={true} onClose={vi.fn()}>
        {playlistMenuItems}
      </Sidebar>,
    );

    expect(container).toMatchSnapshot();
  });

  test('renders sideBar closed', () => {
    const { container } = renderWithRouter(
      <Sidebar isOpen={false} onClose={vi.fn()}>
        {playlistMenuItems}
      </Sidebar>,
    );

    expect(container).toMatchSnapshot();
  });
});
