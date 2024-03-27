import type { ProfilesData } from '@inplayer-org/inplayer.js';

import type { PromiseRequest } from './service';
import type { CommonAccountResponse } from './account';

export type Profile = ProfilesData;

export type ProfilePayload = {
  id?: string;
  name: string;
  adult: boolean;
  avatar_url?: string;
  pin?: number;
};

export type EnterProfilePayload = {
  id: string;
  pin?: number;
};

export type ProfileDetailsPayload = {
  id: string;
};

export type ListProfilesResponse = {
  canManageProfiles: boolean;
  collection: ProfilesData[];
};

export type ProfileFormSubmitError = {
  code: number;
  message: string;
};

export type ProfileFormValues = Omit<ProfilePayload, 'adult'> & { adult: string };

export type ListProfiles = PromiseRequest<undefined, ListProfilesResponse>;
export type CreateProfile = PromiseRequest<ProfilePayload, ProfilesData>;
export type UpdateProfile = PromiseRequest<ProfilePayload, ProfilesData>;
export type EnterProfile = PromiseRequest<EnterProfilePayload, ProfilesData>;
export type GetProfileDetails = PromiseRequest<ProfileDetailsPayload, ProfilesData>;
export type DeleteProfile = PromiseRequest<ProfileDetailsPayload, CommonAccountResponse>;
