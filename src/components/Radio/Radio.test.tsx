import React from 'react';
import { render } from '@testing-library/react';

import Radio from './Radio';

describe('<Radio>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <Radio
        name="radio"
        header={'Choose a Value'}
        onChange={vi.fn()}
        value="value1"
        values={Array.of('value1', 'value2', 'value3')}
        helperText={'This is required!'}
        error={false}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
