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
    if (typeof this.profileService.listProfiles === 'undefined') {
      throw new Error('listProfiles is not available in profile service');
    }

    return this.profileService.listProfiles(undefined, this.getSandbox());
  };

  createProfile = ({ name, adult, avatar_url, pin }: ProfilePayload) => {
    if (typeof this.profileService.createProfile === 'undefined') {
      throw new Error('createProfile is not available in profile service');
    }

    return this.profileService.createProfile({ name, adult, avatar_url, pin }, this.getSandbox());
  };

  updateProfile = ({ id, name, adult, avatar_url, pin }: ProfilePayload) => {
    if (typeof this.profileService.updateProfile === 'undefined') {
      throw new Error('updateProfile is not available in profile service');
    }

    return this.profileService.updateProfile({ id, name, adult, avatar_url, pin }, this.getSandbox());
  };

  enterProfile = ({ id, pin }: EnterProfilePayload) => {
    if (typeof this.profileService.enterProfile === 'undefined') {
      throw new Error('enterProfile is not available in profile service');
    }

    return this.profileService.enterProfile({ id, pin }, this.getSandbox());
  };

  deleteProfile = ({ id }: ProfileDetailsPayload) => {
    if (typeof this.profileService.deleteProfile === 'undefined') {
      throw new Error('deleteProfile is not available in profile service');
    }

    return this.profileService.deleteProfile({ id }, this.getSandbox());
  };

  getProfileDetails = ({ id }: ProfileDetailsPayload) => {
    if (typeof this.profileService.getProfileDetails === 'undefined') {
      throw new Error('getProfileDetails is not available in profile service');
    }

    return this.profileService.getProfileDetails({ id }, this.getSandbox());
  };
}
