import { useAccountStore } from '#src/stores/AccountStore';
import type { Customer, CustomerConsent } from '#types/account';

function useAccount<T>(callback: (args: { customerId: string; customer: Customer; customerConsents: CustomerConsent[] | null }) => T): T {
  const { user, customerConsents } = useAccountStore.getState();

  if (!user?.id) throw new Error('user not logged in');

  return callback({ customerId: user.id, customer: user, customerConsents });
}

export default useAccount;
