import * as React from 'react';
import { render } from '@testing-library/react';

import Filter from './Filter';

const options = ['x', 'y', 'z'];

describe('<Filter>', () => {
  it('renders Filter', () => {
    const { container } = render(<Filter name="categories" value="aa" defaultLabel="bb" options={options} setValue={(event) => event} />);
    expect(container).toMatchSnapshot();
  });
});
