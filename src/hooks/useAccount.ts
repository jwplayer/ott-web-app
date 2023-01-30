import { useAccountStore } from '#src/stores/AccountStore';
import type { AuthData, Customer, CustomerConsent } from '#types/account';

function useAccount<T>(callback: (args: { customerId: string; customer: Customer; customerConsents: CustomerConsent[] | null; auth: AuthData }) => T): T {
  const { user, auth, customerConsents } = useAccountStore.getState();

  if (!user?.id || !auth?.jwt) throw new Error('user not logged in');

  return callback({ customerId: user.id, customer: user, auth, customerConsents });
}

export default useAccount;
