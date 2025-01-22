import type { PaymentMethod } from '@jwp/ott-common/types/checkout';

export const findDefaultCardMethodId = (paymentMethods: PaymentMethod[] | null) => paymentMethods?.find((el) => el.methodName === 'card')?.id?.toString() || '';
