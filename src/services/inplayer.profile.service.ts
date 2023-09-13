import InPlayer from '@inplayer-org/inplayer.js';

import type { ListProfiles, CreateProfile, UpdateProfile, EnterProfile, GetProfileDetails, DeleteProfile } from '#types/account';

export const listProfiles: ListProfiles = async () => {
  try {
    const response = await InPlayer.Account.getProfiles();
    return {
      responseData: {
        canManageProfiles: true,
        collection: response.data,
      },
      errors: [],
    };
  } catch {
    console.error('Unable to list profiles.');
    return {
      responseData: {
        canManageProfiles: false,
        collection: [],
      },
      errors: ['Unable to list profiles.'],
    };
  }
};

export const createProfile: CreateProfile = async (payload) => {
  try {
    const response = await InPlayer.Account.createProfile(payload.name, payload.adult, payload.avatar_url, payload.pin);
    return {
      responseData: response.data,
      errors: [],
    };
  } catch {
    throw new Error('Unable to create profile.');
  }
};

export const updateProfile: UpdateProfile = async (payload) => {
  try {
    if (!payload.id) {
      throw new Error('Profile id is required.');
    }
    const response = await InPlayer.Account.updateProfile(payload.id, payload.name, payload.avatar_url, payload.adult);
    return {
      responseData: response.data,
      errors: [],
    };
  } catch {
    throw new Error('Unable to update profile.');
  }
};

export const enterProfile: EnterProfile = async ({ id, pin }) => {
  try {
    const response = await InPlayer.Account.enterProfile(id, pin);
    return {
      responseData: response.data,
      errors: [],
    };
  } catch {
    throw new Error('Unable to enter profile.');
  }
};

export const getProfileDetails: GetProfileDetails = async ({ id }) => {
  try {
    const response = await InPlayer.Account.getProfileDetails(id);
    return {
      responseData: response.data,
      errors: [],
    };
  } catch {
    throw new Error('Unable to get profile details.');
  }
};

export const deleteProfile: DeleteProfile = async ({ id }) => {
  try {
    await InPlayer.Account.deleteProfile(id);
    return {
      responseData: {
        message: 'Profile deleted successfully',
        code: 200,
      },
      errors: [],
    };
  } catch {
    throw new Error('Unable to delete profile.');
  }
};
