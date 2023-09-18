import type { Profile } from '#types/account';
import { createStore } from '#src/utils/createStore';

type ProfileStore = {
  profile: Profile | null;
  selectingProfileAvatar: string | null;
};

export const useProfileStore = createStore<ProfileStore>('AccountStore', () => ({
  profile: null,
  selectingProfileAvatar: null,
}));
