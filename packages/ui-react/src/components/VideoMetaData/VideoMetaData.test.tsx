import React from 'react';
import { render } from '@testing-library/react';

import VideoMetaData from './VideoMetaData';

describe('<VideoMetaData>', () => {
  test('renders and matches snapshot', () => {
    const attributes = ['2023', 'Comedy', 'something'];
    const { container } = render(<VideoMetaData attributes={attributes} separator="|" />);

    expect(container).toMatchSnapshot();
  });
});
