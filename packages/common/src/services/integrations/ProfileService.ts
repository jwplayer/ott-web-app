import type { CreateProfile, DeleteProfile, EnterProfile, GetProfileDetails, ListProfiles, UpdateProfile } from '../../../types/profiles';

export default abstract class ProfileService {
  abstract listProfiles: ListProfiles;

  abstract createProfile: CreateProfile;

  abstract updateProfile: UpdateProfile;

  abstract enterProfile: EnterProfile;

  abstract getProfileDetails: GetProfileDetails;

  abstract deleteProfile: DeleteProfile;
}
