import { inject, injectable } from 'inversify';
import type { ProfilesData } from '@inplayer-org/inplayer.js';
import * as yup from 'yup';

import { useProfileStore } from './ProfileStore';
import { useConfigStore } from './ConfigStore';

import type { ProfilePayload, EnterProfilePayload, ProfileDetailsPayload } from '#types/account';
import ProfileService from '#src/services/profile.service';
import * as persist from '#src/utils/persist';
import { assertModuleMethod, getNamedModule } from '#src/modules/container';
import type { IntegrationType } from '#types/Config';

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
  private readonly profileService?: ProfileService;

  constructor(@inject('INTEGRATION_TYPE') integrationType: IntegrationType) {
    this.profileService = getNamedModule(ProfileService, integrationType, false);
  }

  private getSandbox = () => {
    return useConfigStore.getState().isSandbox ?? true;
  };

  listProfiles = async () => {
    assertModuleMethod(this.profileService?.listProfiles, 'listProfiles is not available in profile service');

    const res = await this.profileService.listProfiles(undefined, this.getSandbox());

    const { canManageProfiles } = useProfileStore.getState();

    if (!canManageProfiles && res?.responseData.canManageProfiles) {
      useProfileStore.setState({ canManageProfiles: true });
    }

    return res;
  };

  createProfile = async ({ name, adult, avatar_url, pin }: ProfilePayload) => {
    assertModuleMethod(this.profileService?.createProfile, 'createProfile is not available in profile service');

    return this.profileService?.createProfile({ name, adult, avatar_url, pin }, this.getSandbox());
  };

  updateProfile = async ({ id, name, adult, avatar_url, pin }: ProfilePayload) => {
    assertModuleMethod(this.profileService?.updateProfile, 'updateProfile is not available in profile service');

    return this.profileService.updateProfile({ id, name, adult, avatar_url, pin }, this.getSandbox());
  };

  enterProfile = async ({ id, pin }: EnterProfilePayload) => {
    assertModuleMethod(this.profileService?.enterProfile, 'enterProfile is not available in profile service');

    const response = await this.profileService.enterProfile({ id, pin }, this.getSandbox());

    const profile = response?.responseData;

    if (!profile) {
      throw new Error('Unable to enter profile');
    }

    await this.initializeProfile({ profile });
  };

  deleteProfile = async ({ id }: ProfileDetailsPayload) => {
    assertModuleMethod(this.profileService?.deleteProfile, 'deleteProfile is not available in profile service');

    return this.profileService.deleteProfile({ id }, this.getSandbox());
  };

  getProfileDetails = async ({ id }: ProfileDetailsPayload) => {
    assertModuleMethod(this.profileService?.getProfileDetails, 'getProfileDetails is not available in profile service');

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
