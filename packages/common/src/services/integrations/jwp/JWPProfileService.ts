import InPlayer from '@inplayer-org/inplayer.js';
import { injectable } from 'inversify';
import defaultAvatar from '@jwp/ott-theme/assets/profiles/default_avatar.png';

import type { CreateProfile, DeleteProfile, EnterProfile, GetProfileDetails, ListProfiles, UpdateProfile } from '../../../../types/account';
import ProfileService from '../ProfileService';
import StorageService from '../../StorageService';

@injectable()
export default class JWPProfileService extends ProfileService {
  private readonly storageService;

  constructor(storageService: StorageService) {
    super();
    this.storageService = storageService;
  }

  listProfiles: ListProfiles = async () => {
    try {
      const response = await InPlayer.Account.getProfiles();
      return {
        responseData: {
          canManageProfiles: true,
          collection:
            response.data.map((profile) => ({
              ...profile,
              avatar_url: profile?.avatar_url || defaultAvatar,
            })) ?? [],
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

  createProfile: CreateProfile = async (payload) => {
    const response = await InPlayer.Account.createProfile(payload.name, payload.adult, payload.avatar_url, payload.pin);
    return {
      responseData: response.data,
      errors: [],
    };
  };

  updateProfile: UpdateProfile = async (payload) => {
    if (!payload.id) {
      throw new Error('Profile id is required.');
    }
    const response = await InPlayer.Account.updateProfile(payload.id, payload.name, payload.avatar_url, payload.adult);
    return {
      responseData: response.data,
      errors: [],
    };
  };

  enterProfile: EnterProfile = async ({ id, pin }) => {
    try {
      const response = await InPlayer.Account.enterProfile(id, pin);
      const profile = response.data;

      // this sets the inplayer_token for the InPlayer SDK
      if (profile) {
        const tokenData = JSON.stringify({
          expires: profile.credentials.expires,
          token: profile.credentials.access_token,
          refreshToken: '',
        });

        await this.storageService.setItem('inplayer_token', tokenData, false);
      }

      return {
        responseData: profile,
        errors: [],
      };
    } catch {
      throw new Error('Unable to enter profile.');
    }
  };

  getProfileDetails: GetProfileDetails = async ({ id }) => {
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

  deleteProfile: DeleteProfile = async ({ id }) => {
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
}
