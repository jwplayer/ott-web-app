import { inject, injectable } from 'inversify';
import type { ProfilesData } from '@inplayer-org/inplayer.js';
import * as yup from 'yup';

import { useProfileStore } from './ProfileStore';
import { useConfigStore } from './ConfigStore';
import { useAccountStore } from './AccountStore';

import type { ProfilePayload, EnterProfilePayload, ProfileDetailsPayload } from '#types/account';
import ProfileService from '#src/services/profile.service';
import * as persist from '#src/utils/persist';
import type { INTEGRATION } from '#src/config';
import { getNamedModule } from '#src/modules/container';

const PERSIST_PROFILE = 'profile';

const profileSchema = yup.object().shape({
  id: yup.string().required(),
  name: yup.string().required(),
  avatar_url: yup.string(),
  adult: yup.boolean().required(),
  credentials: yup.object().shape({
    access_token: yup.string().required(),
    expires: yup.number().required(),
  }),
});

@injectable()
export default class ProfileController {
  private readonly profileService: ProfileService;

  constructor(@inject('INTEGRATION_TYPE') integrationType: keyof typeof INTEGRATION) {
    this.profileService = getNamedModule(ProfileService, integrationType);
  }

  private getSandbox = () => {
    return useConfigStore.getState().getIntegration().useSandbox ?? true;
  };

  listProfiles = async () => {
    if (typeof this.profileService.listProfiles === 'undefined') {
      throw new Error('listProfiles is not available in profile service');
    }

    const res = await this.profileService.listProfiles(undefined, this.getSandbox());

    const { canManageProfiles } = useAccountStore.getState().features;

    if (!canManageProfiles && res?.responseData.canManageProfiles) {
      useAccountStore.setState((s) => ({ features: { ...s.features, canManageProfiles: true } }));
    }

    return res;
  };

  createProfile = async ({ name, adult, avatar_url, pin }: ProfilePayload) => {
    if (typeof this.profileService.createProfile === 'undefined') {
      throw new Error('createProfile is not available in profile service');
    }

    return this.profileService.createProfile({ name, adult, avatar_url, pin }, this.getSandbox());
  };

  updateProfile = async ({ id, name, adult, avatar_url, pin }: ProfilePayload) => {
    if (typeof this.profileService.updateProfile === 'undefined') {
      throw new Error('updateProfile is not available in profile service');
    }

    return this.profileService.updateProfile({ id, name, adult, avatar_url, pin }, this.getSandbox());
  };

  enterProfile = async ({ id, pin }: EnterProfilePayload) => {
    if (typeof this.profileService.enterProfile === 'undefined') {
      throw new Error('enterProfile is not available in profile service');
    }

    const response = await this.profileService.enterProfile({ id, pin }, this.getSandbox());

    const profile = response?.responseData;

    if (!profile) {
      throw new Error('Unable to enter profile');
    }

    await this.initializeProfile({ profile });
  };

  deleteProfile = async ({ id }: ProfileDetailsPayload) => {
    if (typeof this.profileService.deleteProfile === 'undefined') {
      throw new Error('deleteProfile is not available in profile service');
    }

    return this.profileService.deleteProfile({ id }, this.getSandbox());
  };

  getProfileDetails = async ({ id }: ProfileDetailsPayload) => {
    if (typeof this.profileService.getProfileDetails === 'undefined') {
      throw new Error('getProfileDetails is not available in profile service');
    }

    return this.profileService.getProfileDetails({ id }, this.getSandbox());
  };

  persistProfile = ({ profile }: { profile: ProfilesData }) => {
    persist.setItem(PERSIST_PROFILE, profile);
    persist.setItemStorage('inplayer_token', {
      expires: profile.credentials.expires,
      token: profile.credentials.access_token,
      refreshToken: '',
    });
  };

  unpersistProfile = () => {
    persist.removeItem(PERSIST_PROFILE);
  };

  isValidProfile = (profile: unknown): profile is ProfilesData => {
    try {
      profileSchema.validateSync(profile);
      return true;
    } catch (e: unknown) {
      return false;
    }
  };

  loadPersistedProfile = () => {
    const profile = persist.getItem(PERSIST_PROFILE);
    if (this.isValidProfile(profile)) {
      useProfileStore.getState().setProfile(profile);
      return profile;
    }
    useProfileStore.getState().setProfile(null);
    return null;
  };

  initializeProfile = async ({ profile }: { profile: ProfilesData }) => {
    this.persistProfile({ profile });
    useProfileStore.getState().setProfile(profile);

    return profile;
  };
}
