import Stripe from 'stripe';
import { Product, Price, CheckoutParams } from '@jwp/ott-common/types/payment.js';

import { STRIPE_SECRET } from '../app-config.js';
import { AccessBridgeError } from '../errors.js';
import logger from '../pipeline/logger.js';

import { PaymentService } from './payment-service.js';
import { Viewer } from './identity-service.js';

/**
 * Service class responsible for interacting with the Stripe API to fetch products.
 */
export class StripePaymentService implements PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(STRIPE_SECRET, {
      // By specifying an API version, we ensure that our integration continues to work
      // as expected, even if new versions of the Stripe API are released.
      // If no version is specified, the Stripe client will default to the account's current API version,
      // which may lead to unexpected behavior if the account is upgraded to a newer API.
      apiVersion: '2024-06-20',
    });
  }

  /**
   * Retrieves Stripe products with prices based on the provided productIds.
   * Only products with valid prices are returned.
   * @param productIds The array of product IDs to fetch.
   * @returns A Promise resolving to an array of filtered Product objects.
   */
  async getProductsWithPrices(productIds: string[]): Promise<Product[]> {
    if (!productIds.length) {
      return [];
    }

    const productsWithPrices = await Promise.all(
      productIds.map(async (productId) => {
        try {
          const product = await this.stripe.products.retrieve(productId);
          if (!product.active) {
            // Only include active products
            return null;
          }

          const prices = await this.stripe.prices.list({ product: product.id });
          if (!prices.data.length) {
            // Only include products with prices
            return null;
          }

          const mappedPrices = this.mapPrices(prices.data);

          return this.mapProduct(product, mappedPrices);
        } catch (error) {
          console.error(`Failed to fetch product or prices for product ${productId}:`, error);
          return null; // Skip products that fail to fetch prices
        }
      })
    );

    // Filter out null products (those that failed to retrieve or have no prices)
    return productsWithPrices.filter((product) => product !== null) as Product[];
  }

  /**
   * Creates a Stripe Checkout session URL, where the viewer will be redirected to complete the payment.
   * @param viewer Email address and viewer id from the auth token used for creating the checkout session.
   * @param params Stripe checkout params to use for creating the checkout session.
   * @returns A Promise resolving to a Stripe Checkout Session URL for the checkout page.
   */
  async createCheckoutSessionUrl(viewer: Viewer, params: CheckoutParams): Promise<string | null> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.price_id,
          quantity: 1,
        },
      ],
      metadata: {
        // This is very important as it's our only way of connecting the payment back to the viewer
        viewer_id: viewer.id,
      },
      customer_email: viewer.email,
      mode: 'subscription', // at this moment we only support subscription mode
      success_url: params.success_url,
      cancel_url: params.cancel_url,
      subscription_data: {
        metadata: {
          // This is very important as it's our only way of connecting the payment back to the viewer
          viewer_id: viewer.id,
        },
      },
    };

    const checkoutSession = await this.stripe.checkout.sessions.create(sessionParams);
    return checkoutSession.url;
  }

  /**
   * Creates a Stripe billing portal session for a given customer ID.
   * @param customerId The ID of the customer for whom the session is created.
   * @returns A Promise resolving to the URL of the billing portal session.
   */
  async createBillingPortalSessionUrl(viewer: Viewer, returnUrl: string): Promise<string | null> {
    const customers = await this.stripe.customers.search({
      query: `email:"${viewer.email}"`,
    });

    if (customers.data.length === 0) {
      logger.info(`Viewer 'id: ${viewer.id}, email: ${viewer.email}' does not exist in Stripe.`);
      throw new AccessBridgeError('NotFoundError', {
        description: `Viewer does not exist in Stripe.`,
      });
    }

    // Create the billing portal session using the retrieved customer ID
    const customerId = customers.data[0].id;
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Validates the provided checkout parameters.
   * Checks for the presence of required fields: 'price_id', 'success_url', and 'cancel_url'.
   * If any required parameter is missing, returns an error message; otherwise, returns null.
   * @param params - The checkout parameters to validate.
   * @returns A string containing the name of the missing parameter if validation fails,
   * or null if all required parameters are present.
   */
  validateCheckoutParams(params: CheckoutParams): string | null {
    const requiredParams: (keyof CheckoutParams)[] = ['price_id', 'success_url', 'cancel_url'];
    const missingParam = requiredParams.find((param) => !params[param]);
    return missingParam ? `Missing required parameter: ${missingParam}` : null;
  }

  /**
   * Maps the Stripe product to our custom Product type.
   * @param product The Stripe product object.
   * @param prices The list of custom Price objects mapped from Stripe prices.
   * @returns A Product object with the required fields.
   */
  private mapProduct(product: Stripe.Product, prices: Price[]): Product {
    return {
      store_product_id: product.id,
      name: product.name,
      description: product.description ?? '',
      default_store_price_id: product.default_price as string,
      prices: prices,
    };
  }

  /**
   * Maps Stripe prices to our custom Price type.
   * @param stripePrices The list of Stripe price objects.
   * @returns A list of custom Price objects.
   */
  private mapPrices(stripePrices: Stripe.Price[]): Price[] {
    return stripePrices.map((price) => ({
      store_price_id: price.id,
      currencies: {
        [price.currency]: {
          amount: price.unit_amount,
        },
      },
      default_currency: price.currency,
      recurrence: price.recurring
        ? {
            interval: price.recurring.interval,
            duration: price.recurring.interval_count ?? 1,
            trial_period_interval: 'day', // Stripe only supports day for trial period.
            trial_period_duration: price.recurring.trial_period_days ?? null,
          }
        : 'one_time', // Set 'one_time' if there's no recurrence.
      billing_scheme: 'per_unit', // We only support `per_unit` scheme.
    }));
  }
}
