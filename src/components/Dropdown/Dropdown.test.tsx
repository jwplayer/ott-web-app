import * as React from 'react';
import { render } from '@testing-library/react';

import Dropdown from './Dropdown';
const options = ['x', 'y', 'z'];
describe('<Dropdown>', () => {
  it('renders dropdown', () => {
    const { getByText } = render(
      <Dropdown name="categories" value="aa" defaultLabel="bb" options={options} onChange={(event: React.SyntheticEvent) => event} />,
    );
    const dropdown = getByText(/bb/i);
    expect(document.body.contains(dropdown));
  });
});
