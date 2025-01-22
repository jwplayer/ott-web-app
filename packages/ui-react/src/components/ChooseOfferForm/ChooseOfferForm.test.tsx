import React from 'react';
import { axe } from 'vitest-axe';
import { fireEvent, render } from '@testing-library/react';
import type { Offer } from '@jwp/ott-common/types/checkout';
import monthlyOffer from '@jwp/ott-testing/fixtures/monthlyOffer.json';
import yearlyOffer from '@jwp/ott-testing/fixtures/yearlyOffer.json';
import tvodOffer from '@jwp/ott-testing/fixtures/tvodOffer.json';

import ChooseOfferForm from './ChooseOfferForm';

const svodOffers = [monthlyOffer, yearlyOffer] as Offer[];
const tvodOffers = [tvodOffer] as Offer[];

describe('<OffersForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <ChooseOfferForm
        values={{ selectedOfferId: 'S916977979_NL', selectedOfferType: 'svod' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={svodOffers}
        showOfferTypeSwitch
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('renders and matches snapshot', () => {
    const { container } = render(
      <ChooseOfferForm
        values={{ selectedOfferId: 'R892134629_NL', selectedOfferType: 'tvod' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={tvodOffers}
        showOfferTypeSwitch
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('checks the monthly offer correctly', () => {
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ selectedOfferId: 'S916977979_NL', selectedOfferType: 'svod' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={svodOffers}
        showOfferTypeSwitch
      />,
    );

    expect(getByTestId('S916977979_NL')).toBeChecked();
  });

  test('checks the yearly offer correctly', () => {
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ selectedOfferId: 'S345569153_NL', selectedOfferType: 'svod' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={svodOffers}
        showOfferTypeSwitch
      />,
    );

    expect(getByTestId('S345569153_NL')).toBeChecked();
  });

  test('checks the tvod offer correctly', () => {
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ selectedOfferId: 'R892134629_NL', selectedOfferType: 'tvod' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={tvodOffers}
        showOfferTypeSwitch
      />,
    );

    expect(getByTestId('R892134629_NL')).toBeChecked();
  });

  test('calls the onChange callback when changing the offer', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ selectedOfferId: 'S916977979_NL', selectedOfferType: 'svod' }}
        errors={{}}
        onChange={onChange}
        onSubmit={vi.fn()}
        submitting={false}
        offers={svodOffers}
        showOfferTypeSwitch
      />,
    );

    fireEvent.click(getByTestId('S345569153_NL'));

    expect(onChange).toHaveBeenCalled();
  });

  test('calls the onSubmit callback when submitting the form', () => {
    const onSubmit = vi.fn();
    const { getByTestId } = render(
      <ChooseOfferForm
        values={{ selectedOfferId: 'S916977979_NL', selectedOfferType: 'svod' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        submitting={false}
        offers={svodOffers}
        showOfferTypeSwitch
      />,
    );

    fireEvent.submit(getByTestId('choose-offer-form'));

    expect(onSubmit).toBeCalled();
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(
      <ChooseOfferForm
        values={{ selectedOfferId: 'S916977979_NL', selectedOfferType: 'svod' }}
        errors={{}}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        offers={svodOffers}
        showOfferTypeSwitch
      />,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
