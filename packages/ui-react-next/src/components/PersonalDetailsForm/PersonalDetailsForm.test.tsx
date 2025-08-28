import { render } from '@testing-library/react';

import PersonalDetailsForm from './PersonalDetailsForm';

const noop = () => {
  /**/
};
const initialValues = {
  firstName: 'Vince',
  lastName: 'Guy',
  birthDate: '27-Feb-1985',
  companyName: 'JW Player',
  phoneNumber: '+1 555 555 5555',
  address: '123 Nowhere St.',
  address2: 'Apt 1W',
  city: 'Chicago',
  state: 'IL',
  postCode: '60601',
  country: 'United States',
};
const fields = {
  firstNameLastName: {
    key: 'fnln',
    enabled: true,
    required: true,
    answer: '',
  },
  companyName: {
    key: 'c',
    enabled: true,
    required: false,
    answer: '',
  },
  address: {
    key: 'a',
    enabled: true,
    required: true,
    answer: '',
  },
  phoneNumber: {
    key: 'pn',
    enabled: true,
    required: true,
    answer: '',
  },
  birthDate: {
    key: 'dob',
    enabled: true,
    required: true,
    answer: '',
  },
};
const questions = [
  {
    key: 'key1',
    question: 'Which number is 2?',
    value: '1;2;3',
    answer: '',
    required: true,
    enabled: true,
  },
  {
    key: 'key2',
    question: 'Is this a question?',
    value: 'Yes;No',
    answer: '',
    required: false,
    enabled: true,
  },
  {
    key: 'ccc',
    question: 'Check this off.',
    value: 'CheckMe',
    answer: '',
    required: true,
    enabled: true,
  },
];
const questionValues = {
  key1: '3',
  key2: 'No',
  ccc: 'true',
};

describe('<PersonalDetailsForm>', () => {
  test('Renders without crashing', () => {
    const { container } = render(
      <PersonalDetailsForm
        initialValues={initialValues}
        onSubmit={noop}
        fields={fields}
        questions={questions}
        onQuestionChange={noop}
        questionValues={questionValues}
        questionErrors={{}}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('Renders with errors', () => {
    const { container } = render(
      <PersonalDetailsForm
        initialValues={initialValues}
        onSubmit={noop}
        fields={fields}
        questions={questions}
        onQuestionChange={noop}
        questionValues={questionValues}
        questionErrors={{
          key1: 'question 1 is invalid',
          key2: 'Invalid answer',
          ccc: 'No way Jose',
        }}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
