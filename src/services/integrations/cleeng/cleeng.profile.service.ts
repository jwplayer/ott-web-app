import { injectable } from 'inversify';

import ProfileService from '../../profile.service';

@injectable()
export default class CleengProfileService extends ProfileService {
  listProfiles: undefined;

  createProfile: undefined;

  updateProfile: undefined;

  enterProfile: undefined;

  getProfileDetails: undefined;

  deleteProfile: undefined;
}
