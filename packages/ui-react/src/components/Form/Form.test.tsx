import * as React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import Form from './Form';

describe('<Form>', () => {
  const initialValues = { test: 'Testing' };

  it('renders Form', () => {
    const { container } = render(
      <Form initialValues={initialValues}>
        {[
          {
            label: 'Edit This',
            editButton: 'Edit Button',
            saveButton: 'Save Button',
            cancelButton: 'Cancel Button',
            content: (section) => (
              <input
                name="test"
                value={section.values.test || ''}
                onChange={() => {
                  /**/
                }}
              />
            ),
          },
        ]}
      </Form>,
    );
    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(
      <Form initialValues={initialValues}>
        {[
          {
            label: 'Edit This',
            editButton: 'Edit Button',
            saveButton: 'Save Button',
            cancelButton: 'Cancel Button',
            content: (section) => (
              <input
                name="test"
                value={section.values.test || ''}
                onChange={() => {
                  /**/
                }}
              />
            ),
          },
        ]}
      </Form>,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
