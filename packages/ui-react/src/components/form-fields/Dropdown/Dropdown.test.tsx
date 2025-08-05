import * as React from 'react';
import { render } from '@testing-library/react';

import Dropdown from './Dropdown';

const options = ['x', 'y', 'z'];
describe('<Dropdown>', () => {
  it('renders dropdown', () => {
    const { getByLabelText } = render(
      <Dropdown name="categories" value="aa" defaultLabel="bb" options={options} onChange={(event: React.SyntheticEvent) => event} />,
    );
    const dropdown = getByLabelText(/bb/i);
    expect(document.body.contains(dropdown)).toBe(true);
  });
});
