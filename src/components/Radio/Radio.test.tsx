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
        values={Array.of({ value: 'value1', label: 'Label 1 ' }, { value: 'value2', label: 'Label 2 ' }, { value: 'value3', label: 'Label 3 ' })}
        helperText={'This is required!'}
        error={false}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
