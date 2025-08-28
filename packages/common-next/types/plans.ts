type AccessOptions = {
  drm_policy_id: string;
  include_tags: string[] | null;
  exclude_tags: string[] | null;
  include_custom_params: string[] | null;
  exclude_custom_params: string[] | null;
};

type PlanExternalProviders = {
  stripe?: string;
  apple?: string;
  google?: string;
};

export type AccessControlPlan = {
  id: string;
  exp: number;
};

export type Plan = {
  id: string;
  original_id: number;
  exp: number;
  metadata: {
    name: string;
    access: AccessOptions;
    access_model: 'free' | 'freeauth' | 'svod';
    external_providers: PlanExternalProviders;
  };
};

export type PlansResponse = {
  total: number;
  page: number;
  page_length: number;
  plans: Plan[];
};
