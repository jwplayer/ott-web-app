import React from 'react';

import { render } from '../../testUtils';

import SideBar from './SideBar';

describe('<SideBar />', () => {
  test('renders sideBar', () => {
    const { container } = render(
      <SideBar sideBarOpen={true} closeSideBar={jest.fn()} />,
    );

    expect(container).toMatchSnapshot();
  });
});
