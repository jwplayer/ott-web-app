import React from 'react';
import { render } from '@testing-library/react';

import { CustomRegisterField } from './CustomRegisterField';

describe('<CustomRegisterField>', () => {
  test('renders and matches snapshot <Checkbox>', () => {
    const { container } = render(<CustomRegisterField type="checkbox" label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <TextField>', () => {
    const { container } = render(<CustomRegisterField type="input" label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Radio>', () => {
    const { container } = render(<CustomRegisterField type="radio" label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="select">', () => {
    const { container } = render(<CustomRegisterField type="select" label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="country">', () => {
    const { container } = render(<CustomRegisterField type="country" label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="us_state">', () => {
    const { container } = render(<CustomRegisterField type="us_state" label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="datepicker">', () => {
    const { container } = render(<CustomRegisterField type="datepicker" label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="randomstring">', () => {
    // @ts-ignore
    const { container } = render(<CustomRegisterField type="randomstring" label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
