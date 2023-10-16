import { injectable } from 'inversify';

import { useConfigStore } from './ConfigStore';

import type { ProfilePayload, EnterProfilePayload, ProfileDetailsPayload } from '#types/account';
import ProfileService from '#src/services/profile.service';

@injectable()
export default class ProfileController {
  private readonly profileService: ProfileService;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
  }

  private getSandbox = () => {
    return useConfigStore.getState().getIntegration().useSandbox ?? true;
  };

  listProfiles = () => {
    return this.profileService?.listProfiles(undefined, this.getSandbox());
  };

  createProfile = ({ name, adult, avatar_url, pin }: ProfilePayload) => {
    return this.profileService?.createProfile({ name, adult, avatar_url, pin }, this.getSandbox());
  };

  updateProfile = ({ id, name, adult, avatar_url, pin }: ProfilePayload) => {
    return this.profileService?.updateProfile({ id, name, adult, avatar_url, pin }, this.getSandbox());
  };

  enterProfile = ({ id, pin }: EnterProfilePayload) => {
    return this.profileService?.enterProfile({ id, pin }, this.getSandbox());
  };

  deleteProfile = ({ id }: ProfileDetailsPayload) => {
    return this.profileService?.deleteProfile({ id }, this.getSandbox());
  };

  getProfileDetails = ({ id }: ProfileDetailsPayload) => {
    return this.profileService?.getProfileDetails({ id }, this.getSandbox());
  };
}
