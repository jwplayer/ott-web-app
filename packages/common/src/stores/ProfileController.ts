import { inject, injectable } from 'inversify';
import type { ProfilesData } from '@inplayer-org/inplayer.js';
import * as yup from 'yup';

import type { EnterProfilePayload, ProfileDetailsPayload, ProfilePayload } from '../../types/account';
import ProfileService from '../services/ProfileService';
import type { IntegrationType } from '../../types/config';
import { assertModuleMethod, getNamedModule } from '../modules/container';
import StorageService from '../services/StorageService';
import { INTEGRATION_TYPE } from '../modules/types';

import { useProfileStore } from './ProfileStore';
import { useConfigStore } from './ConfigStore';

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
  private readonly storageService: StorageService;

  constructor(@inject(INTEGRATION_TYPE) integrationType: IntegrationType, storageService: StorageService) {
    this.profileService = getNamedModule(ProfileService, integrationType, false);
    this.storageService = storageService;
  }

  private getSandbox = () => {
    return useConfigStore.getState().isSandbox ?? true;
  };

  private isValidProfile = (profile: unknown): profile is ProfilesData => {
    try {
      profileSchema.validateSync(profile);
      return true;
    } catch (e: unknown) {
      return false;
    }
  };

  listProfiles = async () => {
    assertModuleMethod(this.profileService?.listProfiles, 'listProfiles is not available in profile service');

    const res = await this.profileService?.listProfiles(undefined, this.getSandbox());

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

    return this.profileService?.updateProfile({ id, name, adult, avatar_url, pin }, this.getSandbox());
  };

  enterProfile = async ({ id, pin }: EnterProfilePayload) => {
    assertModuleMethod(this.profileService?.enterProfile, 'enterProfile is not available in profile service');

    const response = await this.profileService?.enterProfile({ id, pin }, this.getSandbox());

    const profile = response?.responseData;

    if (!profile) {
      throw new Error('Unable to enter profile');
    }

    await this.initializeProfile({ profile });
  };

  deleteProfile = async ({ id }: ProfileDetailsPayload) => {
    assertModuleMethod(this.profileService?.deleteProfile, 'deleteProfile is not available in profile service');

    return this.profileService?.deleteProfile({ id }, this.getSandbox());
  };

  getProfileDetails = async ({ id }: ProfileDetailsPayload) => {
    assertModuleMethod(this.profileService?.getProfileDetails, 'getProfileDetails is not available in profile service');

    return this.profileService?.getProfileDetails({ id }, this.getSandbox());
  };

  persistProfile = ({ profile }: { profile: ProfilesData }) => {
    this.storageService.setItem(PERSIST_PROFILE, JSON.stringify(profile));
  };

  unpersistProfile = async () => {
    await this.storageService.removeItem(PERSIST_PROFILE);
  };

  loadPersistedProfile = async () => {
    const profile = await this.storageService.getItem(PERSIST_PROFILE, true);

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
