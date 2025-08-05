import React from 'react';
import { render } from '@testing-library/react';

import Select from './Select';

describe('<VideoMetaData>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<Select name="choices" options={['a', 'b', 'c']} label="Choose an option" />);

    expect(container).toMatchSnapshot();
  });
});
