import React from 'react';
import { render } from '@testing-library/react';

import ShareButton from './ShareButton';

describe('<ShareButton>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<ShareButton title="Share title" description="Share description" url="https://jwplayer.com" />);

    expect(container).toMatchSnapshot();
  });
});
