import * as React from 'react';
import { render } from '@testing-library/react';

import '../../hooks/matchMedia.mock';
import Dropdown from './Filter';

const options = ['x', 'y', 'z'];

describe('<Dropdown>', () => {
  it('renders dropdown', () => {
    const { container } = render(
      <Dropdown
        name="categories"
        value="aa"
        defaultLabel="bb"
        options={options}
        setValue={(event) => event}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
