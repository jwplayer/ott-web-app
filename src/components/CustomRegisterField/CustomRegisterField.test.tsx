import React from 'react';
import { render } from '@testing-library/react';

import CustomRegisterField from './CustomRegisterField';

import { ConsentFieldVariants } from '#src/services/inplayer.account.service';

describe('<CustomRegisterField>', () => {
  test('renders and matches snapshot <Checkbox>', () => {
    const { container } = render(<CustomRegisterField type={ConsentFieldVariants.CHECKBOX} label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <TextField>', () => {
    const { container } = render(<CustomRegisterField type={ConsentFieldVariants.INPUT} label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Radio>', () => {
    const { container } = render(<CustomRegisterField type={ConsentFieldVariants.RADIO} label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="select">', () => {
    const { container } = render(<CustomRegisterField type={ConsentFieldVariants.GENERAL_SELECT} label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="country">', () => {
    const { container } = render(<CustomRegisterField type={ConsentFieldVariants.COUNTRY_SELECT} label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="us_state">', () => {
    const { container } = render(
      <CustomRegisterField type={ConsentFieldVariants.US_STATE_SELECT} label="label" name="name" value="value" onChange={vi.fn()} />,
    );

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="datepicker">', () => {
    const { container } = render(<CustomRegisterField type={ConsentFieldVariants.DATE_PICKER} label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot <Dropdown type="randomstring">', () => {
    // @ts-ignore
    const { container } = render(<CustomRegisterField type="randomstring" label="label" name="name" value="value" onChange={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
