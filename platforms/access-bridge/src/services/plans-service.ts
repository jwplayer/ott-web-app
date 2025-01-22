import { Plan, PlansResponse } from '@jwp/ott-common/types/plans.js';

import { SIMS_API_HOST, SITE_ID } from '../app-config.js';
import { get } from '../http.js';

/**
 * Service class responsible for interacting with the Plans API.
 */
export class PlansService {
  /**
   * Fetches a list of plans available for a specific site.
   * These are the plans defined by the customer that are available for purchase by viewers.
   *
   * @returns A Promise that resolves to an array of `Plan` objects.
   * If no plans are available, an empty array is returned.
   */
  async getAvailablePlans(): Promise<Plan[]> {
    const response = await get<PlansResponse>(`${SIMS_API_HOST}/v3/sites/${SITE_ID}/plans`);
    if (!response?.plans) {
      return [];
    }

    return response.plans;
  }

  /**
   * Fetches a list of plans available / purchased for a specific site by the viewer.
   * These plans are stored in the user's passport, enabling access to specific content.
   * @param authorization The Bearer token used to authenticate the viewer and their entitlements.
   * This parameter can be undefined if only free plans are to be fetched.
   * @returns A Promise that resolves to an array of `Plan` objects.
   * If no plans are available, an empty array is returned.
   */
  async getEntitledPlans({ authorization }: { authorization?: string }): Promise<Plan[]> {
    const response = await get<PlansResponse>(`${SIMS_API_HOST}/v3/sites/${SITE_ID}/entitlements`, authorization);
    if (!response?.plans) {
      return [];
    }

    return response.plans;
  }
}
