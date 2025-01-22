import * as React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import Filter from './Filter';

const options = ['x', 'y', 'z'];

describe('<Filter>', () => {
  it('renders Filter', () => {
    const { container } = render(<Filter name="categories" value="aa" defaultLabel="bb" options={options} setValue={(event) => event} />);
    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(<Filter name="categories" value="aa" defaultLabel="bb" options={options} setValue={(event) => event} />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
