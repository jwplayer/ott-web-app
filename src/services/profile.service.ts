import type { ListProfiles, CreateProfile, UpdateProfile, EnterProfile, GetProfileDetails, DeleteProfile } from '#types/account';

export default interface ProfileService {
  listProfiles: ListProfiles;

  createProfile: CreateProfile;

  updateProfile: UpdateProfile;

  enterProfile: EnterProfile;

  getProfileDetails: GetProfileDetails;

  deleteProfile: DeleteProfile;
}
