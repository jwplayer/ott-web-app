import React from 'react';
import { render } from '@testing-library/react';

import PersonalDetailsForm from './PersonalDetailsForm';

describe('<PersonalDetailsForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <PersonalDetailsForm
        onChange={jest.fn()}
        onSubmit={jest.fn()}
        submitting={false}
        fields={[]}
        values={{
          email: '',
          password: '',
        }}
        errors={{}}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
