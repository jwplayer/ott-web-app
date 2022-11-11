import React from 'react';

import { renderWithRouter } from '#test/testUtils';
import DemoConfigDialog from '#src/components/DemoConfigDialog/DemoConfigDialog';

describe('<DemoConfigDialog>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<DemoConfigDialog isConfigSuccess={true} settings={{ defaultConfigSource: 'abcdefgh' }} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot error dialog', () => {
    const { container } = renderWithRouter(<DemoConfigDialog isConfigSuccess={false} settings={{ defaultConfigSource: 'aaaaaaaa' }} />);

    expect(container).toMatchSnapshot();
  });
});
