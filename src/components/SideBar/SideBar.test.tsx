import React from 'react';

import { render } from '../../testUtils';

import SideBar from './SideBar';

describe('<SideBar />', () => {
  test('renders sideBar', () => {
    const { container } = render(<SideBar isOpen={true} onClose={jest.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
