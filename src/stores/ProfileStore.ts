import { createStore } from '#src/stores/utils';
import type { Profile } from '#types/account';

type ProfileStore = {
  profile: Profile | null;
  selectingProfileAvatar: string | null;
};

export const useProfileStore = createStore<ProfileStore>('AccountStore', () => ({
  profile: null,
  selectingProfileAvatar: null,
}));
