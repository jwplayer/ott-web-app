import { createStore } from '#src/stores/utils';
import type { Profile } from '#types/account';
import defaultAvatar from '#src/assets/profiles/default_avatar.png';

type ProfileStore = {
  profile: Profile | null;
  selectingProfileAvatar: string | null;
  setProfile: (profile: Profile | null) => void;
};

export const useProfileStore = createStore<ProfileStore>('AccountStore', () => ({
  profile: null,
  selectingProfileAvatar: null,
  setProfile: (profile) => {
    useProfileStore.setState({
      profile: profile
        ? {
            ...profile,
            avatar_url: profile?.avatar_url || defaultAvatar,
          }
        : null,
    });
  },
}));
