import { injectable } from 'inversify';

import ProfileService from './profile.service';

import type { ListProfiles, CreateProfile, UpdateProfile, EnterProfile, GetProfileDetails, DeleteProfile } from '#types/account';

@injectable()
export default class CleengProfileService extends ProfileService {
  listProfiles: ListProfiles = async () => {
    throw new Error('Method is not supported');
  };

  createProfile: CreateProfile = async () => {
    throw new Error('Method is not supported');
  };

  updateProfile: UpdateProfile = async () => {
    throw new Error('Method is not supported');
  };

  enterProfile: EnterProfile = async () => {
    throw new Error('Method is not supported');
  };

  getProfileDetails: GetProfileDetails = async () => {
    throw new Error('Method is not supported');
  };

  deleteProfile: DeleteProfile = async () => {
    throw new Error('Method is not supported');
  };
}
