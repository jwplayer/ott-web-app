import React from 'react';
import { render } from '@testing-library/react';

import FilterModal from './FilterModal';

describe('<FilterModal>', () => {
  const filterButtons = [<button key="button" />];
  test('renders and matches snapshot', () => {
    const { container } = render(
      <FilterModal name={'aa'} isOpen={true} onClose={() => false}>
        {filterButtons}
      </FilterModal>,
    );

    expect(container).toMatchSnapshot();
  });
});
