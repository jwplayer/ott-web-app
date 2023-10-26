import React from 'react';

import { renderWithRouter } from '#test/testUtils';
import DemoConfigDialog from '#components/DemoConfigDialog/DemoConfigDialog';

describe('<DemoConfigDialog>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<DemoConfigDialog isSuccess={true} error={undefined} isLoading={false} selectedConfigSource={'abcdefgh'} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot error dialog', () => {
    const { container } = renderWithRouter(
      <DemoConfigDialog isSuccess={false} error={new Error('smth')} isLoading={false} selectedConfigSource={'aaaaaaaa'} />,
    );

    expect(container).toMatchSnapshot();
  });
});
