import type { ListProfiles, CreateProfile, UpdateProfile, EnterProfile, GetProfileDetails, DeleteProfile } from '#types/account';

export default abstract class ProfileService {
  abstract listProfiles?: ListProfiles;

  abstract createProfile?: CreateProfile;

  abstract updateProfile?: UpdateProfile;

  abstract enterProfile?: EnterProfile;

  abstract getProfileDetails?: GetProfileDetails;

  abstract deleteProfile?: DeleteProfile;
}
