import * as React from 'react';
import { render } from '@testing-library/react';

import Form from './Form';

describe('<Form>', () => {
  const initialValues = { test: 'Testing' };

  it('renders Form', () => {
    const { container } = render(
      <Form initialValues={initialValues} onSubmit={() => null}>
        {({ values, onChange }) => <input name="test" value={values.test || ''} onChange={onChange} />}
      </Form>,
    );
    expect(container).toMatchSnapshot();
  });
});
