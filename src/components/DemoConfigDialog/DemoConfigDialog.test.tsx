import React from 'react';

import { renderWithRouter } from '#test/testUtils';
import DemoConfigDialog from '#src/components/DemoConfigDialog/DemoConfigDialog';

describe('<DemoConfigDialog>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<DemoConfigDialog configLocation={''} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot with ID', () => {
    const { container } = renderWithRouter(<DemoConfigDialog configLocation={'gnnuzabk'} />);

    expect(container).toMatchSnapshot();
  });
});
