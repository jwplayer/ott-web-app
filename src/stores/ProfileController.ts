import { inject, injectable } from 'inversify';

import { useConfigStore } from './ConfigStore';

import type { ProfilePayload, EnterProfilePayload, ProfileDetailsPayload } from '#types/account';
import { SERVICES } from '#src/ioc/types';
import type ProfileService from '#src/services/profile.service';

@injectable()
export default class ProfileController {
  private profileService!: ProfileService;

  constructor(@inject(SERVICES.Profile) profileService: ProfileService) {
    this.profileService = profileService;
  }

  listProfiles = async () => {
    const { getSandbox } = useConfigStore.getState();
    const sandbox = getSandbox();

    return await this.profileService?.listProfiles(undefined, sandbox ?? true);
  };

  createProfile = async ({ name, adult, avatar_url, pin }: ProfilePayload) => {
    const { getSandbox } = useConfigStore.getState();
    const sandbox = getSandbox();

    return await this.profileService?.createProfile({ name, adult, avatar_url, pin }, sandbox ?? true);
  };

  updateProfile = async ({ id, name, adult, avatar_url, pin }: ProfilePayload) => {
    const { getSandbox } = useConfigStore.getState();
    const sandbox = getSandbox();

    return await this.profileService?.updateProfile({ id, name, adult, avatar_url, pin }, sandbox ?? true);
  };

  enterProfile = async ({ id, pin }: EnterProfilePayload) => {
    const { getSandbox } = useConfigStore.getState();
    const sandbox = getSandbox();

    return await this.profileService?.enterProfile({ id, pin }, sandbox ?? true);
  };

  deleteProfile = async ({ id }: ProfileDetailsPayload) => {
    const { getSandbox } = useConfigStore.getState();
    const sandbox = getSandbox();

    return await this.profileService?.deleteProfile({ id }, sandbox ?? true);
  };

  getProfileDetails = async ({ id }: ProfileDetailsPayload) => {
    const { getSandbox } = useConfigStore.getState();
    const sandbox = getSandbox();

    return await this.profileService?.getProfileDetails({ id }, sandbox ?? true);
  };
}
