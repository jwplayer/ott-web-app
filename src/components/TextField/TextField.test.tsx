import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import TextField from './TextField';

describe('<TextField>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(<TextField label="Label" placeholder="Placeholder" name="name" value="" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches multiline snapshot', () => {
    const { container } = render(<TextField label="Label" placeholder="Placeholder" name="name" value="" onChange={vi.fn()} multiline={true} />);

    expect(container).toMatchSnapshot();
  });

  test('triggers an onChange event when the input value changes', () => {
    const onChange = vi.fn();
    const { getByPlaceholderText } = render(<TextField value="" onChange={onChange} placeholder="Enter your name" />);

    fireEvent.change(getByPlaceholderText('Enter your name'), { target: { value: 'John Doe' } });

    expect(onChange).toBeCalled();
  });

  test('shows the helper text below the input', () => {
    const { queryByText } = render(<TextField value="" onChange={vi.fn()} helperText="Assertive text" />);

    expect(queryByText('Assertive text')).toBeDefined();
  });
});
