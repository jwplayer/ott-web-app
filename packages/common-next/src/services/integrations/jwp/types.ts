export type JWPAuthData = {
  access_token: string;
  expires?: number;
};

export type JWPError = {
  response: {
    data: {
      code: number;
      message: string;
    };
  };
};

export type CommonResponse = {
  code: number;
  message: string;
};

export type AccountData = {
  id: number;
  email: string;
  full_name: string;
  referrer: string;
  metadata: Record<string, unknown>;
  social_apps_metadata: Record<string, unknown>[];
  roles: string[];
  completed: boolean;
  created_at: number;
  updated_at: number;
  date_of_birth: number;
  uuid: string;
  merchant_uuid: string;
};

export type CreateAccount = {
  access_token: string;
  expires: number;
  account: AccountData;
};

export type RegisterFieldOptions = Record<string, string>;

export type RegisterField = {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  default_value: string;
  placeholder: string;
  options: RegisterFieldOptions;
};

export type GetRegisterFieldsResponse = {
  collection: RegisterField[];
};

type CollectionWithCursor<T> = {
  collection: T[];
  cursor?: string;
};

export type WatchHistory = {
  media_id: string;
  progress: number;
  created_at: number;
  updated_at: number;
};

export type GetWatchHistoryResponse = CollectionWithCursor<WatchHistory>;

export type FavoritesData = {
  media_id: string;
  created_at: number;
};

export type GetFavoritesResponse = CollectionWithCursor<FavoritesData>;

export type SocialURLs = {
  facebook: string;
  twitter: string;
  google: string;
};

export type ListSocialURLs = {
  social_urls: SocialURLs[];
  code: number;
};

export type SignedMediaResponse = {
  token: string;
};

export type AccessType = {
  id: number;
  account_id: number;
  name: string;
  quantity: number;
  period: string;
  updated_at: number;
  created_at: number;
};

export type AccessControlType = {
  id: number;
  name: string;
  auth: boolean;
};

export type ItemType = {
  id: number;
  name: string;
  content_type: string;
  host: string;
  description: string;
};

export type AgeRestriction = {
  min_age: number;
};

export type Item = {
  id: number;
  merchant_id: number;
  merchant_uuid: string;
  active: boolean;
  title: string;
  access_control_type: AccessControlType;
  item_type: ItemType;
  age_restriction: AgeRestriction | null;
  metadata?: Record<string, string>[];
  metahash?: Record<string, string>;
  content?: string;
  template_id: number | null;
  created_at: number;
  update_at: number;
  plan_switch_enabled: boolean;
};

export type TrialPeriod = {
  quantity: number;
  period: string;
  description: string;
};

export type SetupFee = {
  id: number;
  fee_amount: number;
  description: string;
};

export type SeasonalFee = {
  id: number;
  access_fee_id: number;
  merchant_id: number;
  current_price_amount: number;
  off_season_access: boolean;
  anchor_date: number;
  created_at: number;
  updated_at: number;
};

export type ExternalFee = {
  id: number;
  payment_provider_id: number;
  access_fee_id: number;
  external_id: string;
  merchant_id: number;
};

export type GeoRestriction = {
  id: number;
  country_iso: string;
  country_set_id: number;
  type: string;
};

export type CurrentPhase = {
  access_fee_id: number;
  anchor_date: number;
  created_at: number;
  currency: string;
  current_price: number;
  expires_at: number;
  id: number;
  season_price: number;
  starts_at: number;
  status: string;
  updated_at: number;
};

export type AccessFee = {
  id: number;
  merchant_id: number;
  amount: number;
  currency: string;
  description: string;
  expires_at: number;
  starts_at: number;
  updated_at: number;
  title: string;
  created_at: number;
  merchant_uuid: string;
  access_type: AccessType;
  plan_switch_enabled: boolean;
  item: Item;
  item_id: number;
  next_phase: CurrentPhase | null;
  template_id: number | null;
  trial_period: TrialPeriod | null;
  setup_fee: SetupFee | null;
  seasonal_fee: SeasonalFee | null;
  external_fees: Array<ExternalFee> | null;
  geo_restriction: GeoRestriction | null;
  current_phase: CurrentPhase | null;
};

export type GetAccessFeesResponse = AccessFee[];

export type MerchantPaymentMethod = {
  id: number;
  method_name: string;
  is_external: boolean;
};

export type GeneratePayPalParameters = {
  endpoint: string;
  business: string;
  item_name: string;
  currency_code: string;
  return: string;
  cancel_return: string;
  id?: string;
};

export type VoucherDiscountPrice = {
  amount: number;
  discount_duration: number;
};

export type ItemDetails = {
  id: number;
  merchant_id: number;
  merchant_uuid: string;
  is_active: boolean;
  title: string;
  access_control_type: AccessControlType;
  item_type: ItemType;
  age_restriction: Record<string, number>;
  metadata: Record<string, string>[];
  created_at: number;
  updated_at: number;
  content: string;
};

export type GetItemAccessResponse = {
  id: number;
  account_id: number;
  customer_id: number;
  customer_uuid: string;
  ip_address: string;
  country_code: string;
  created_at: number;
  expires_at: number;
  item: ItemDetails;
};

export type JWPSubscription = {
  cancel_token: string;
  status: string;
  description: string;
  asset_title: string;
  asset_id: number;
  formatted_amount: string;
  amount: number;
  currency: string;
  merchant_id: number;
  created_at: number;
  updated_at: number;
  next_billing_date: number;
  unsubscribe_url: string;
};

export type GetSubscriptionsResponse = {
  total: number;
  page: number;
  offset: number;
  limit: number;
  collection: JWPSubscription[];
};

export type PaymentHistory = {
  merchant_id: number;
  consumer_id: number;
  gateway_id: number;
  transaction_token: string;
  payment_tool_token: string;
  trx_token: string;
  payment_method_name: string;
  action_type: string;
  item_access_id: number;
  item_id: number;
  item_type: string;
  item_title: string;
  charged_amount: number;
  currency_iso: string;
  note: string;
  created_at: number;
};
export type GetPaymentHistoryResponse = {
  collection: PaymentHistory[];
  total: number;
};

export type Card = {
  number: number;
  card_name: string;
  exp_month: string;
  exp_year: string;
  card_type: string;
  account_id: number;
};

export type GetDefaultCardResponse = {
  cards: Card[];
};

export type CancelSubscriptionResponse = {
  code: number;
  subscription: string;
  operation: string;
  description: string;
  status: string;
  timestamp: number;
};

export type ChangeSubscriptionPlanResponse = {
  message: string;
};

export type SetDefaultCardResponse = {
  number: number;
  card_name: string;
  exp_month: string;
  exp_year: string;
};
