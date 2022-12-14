import InPlayer, { SubscriptionDetails as InplayerSubscription } from '@inplayer-org/inplayer.js';

import type { Subscription } from '#types/subscription';
import type { Config } from '#types/Config';

interface SubscriptionDetails extends InplayerSubscription {
  item_id?: number;
  item_title?: string;
  subscription_id?: string;
  subscription_price?: number;
  action_type?: 'recurrent' | 'canceled' | 'free-trial' | 'ended' | 'incomplete_expired';
  next_rebill_date?: number;
  charged_amount?: number;
  payment_method_name?: string;
  access_type?: {
    period: string;
  };
}

export async function getActiveSubscription({ config }: { config: Config }) {
  try {
    const assetId = config.integrations.inplayer?.assetId || 0;
    const { data: hasAccess } = await InPlayer.Asset.checkAccessForAsset(assetId);

    if (hasAccess) {
      const { data } = await InPlayer.Subscription.getSubscriptions();
      const activeSubscription = data.collection.find((subscription: SubscriptionDetails) => subscription.item_id === assetId);
      if (activeSubscription) {
        return processActiveSubscription(activeSubscription);
      }
    }
    return null;
  } catch {
    throw new Error('Unable to fetch customer subscriptions.');
  }
}

export async function getAllTransactions() {
  return null;
}

export async function getActivePayment() {
  return null;
}

const processActiveSubscription = (subscription: SubscriptionDetails) => {
  let status = '';
  switch (subscription.action_type) {
    case 'free-trial' || 'recurrent':
      status = 'active';
      break;
    case 'canceled':
      status = 'cancelled';
      break;
    case 'incomplete_expired' || 'ended':
      status = 'expired';
      break;
    default:
      status = 'terminated';
  }

  return {
    subscriptionId: subscription.subscription_id,
    offerId: subscription.item_id,
    status,
    expiresAt: subscription.next_rebill_date,
    nextPaymentAt: subscription.next_rebill_date,
    nextPaymentPrice: subscription.subscription_price,
    nextPaymentCurrency: subscription.currency,
    paymentGateway: 'stripe',
    paymentMethod: subscription.payment_method_name,
    offerTitle: subscription.item_title,
    period: subscription.access_type?.period,
    totalPrice: subscription.charged_amount,
  } as Subscription;
};
