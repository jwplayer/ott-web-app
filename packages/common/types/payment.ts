type Recurrence = {
  // The frequency at which a subscription is billed. One of `day`, `week`, `month`, or `year`.
  interval: 'day' | 'week' | 'month' | 'year';
  // Recurrence duration, for example, `interval=month` and `duration=3` bills every 3 months.
  duration: number;
  // Trial period interval. For example, a month-long trial is different from a 30-day trial.
  trial_period_interval: 'day' | 'week' | 'month' | 'year';
  // Duration of the trial period (in the unit defined by trial_period_interval).
  trial_period_duration: number | null;
};

export type Price = {
  // Unique identifier for the object.
  store_price_id: string;
  // Dictionary of currencies, where the key is the currency code and the value is an object with an amount property.
  // Three-letter [ISO currency code](https://www.iso.org/iso-4217-currency-codes.html), in lowercase.
  currencies: {
    [currency_code: string]: {
      // The unit amount in cents (or local equivalent) to be charged, represented as a whole integer.
      amount: number | null;
    };
  };
  // Default currency code for this price.
  default_currency: string;
  // Recurrence details. Can be a Recurrence object or 'one_time'.
  recurrence: Recurrence | 'one_time';
  // Billing scheme. For now, we only support `per_unit`.
  billing_scheme: 'per_unit';
};

export type Product = {
  // Unique identifier for the object.
  store_product_id: string;
  // The product's name, meant to be displayable to the customer.
  name: string;
  // The product's description, meant to be displayable to the customer.
  description: string;
  // The ID of the default price this product is associated with.
  default_store_price_id: string;
  // Array of price objects.
  prices: Price[];
};

// General checkout parameters type. Can be extended by specific payment providers, e.g. Stripe
export type CheckoutParams = {
  price_id: string;
  success_url: string;
  cancel_url: string;
};
