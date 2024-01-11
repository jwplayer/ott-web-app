import type { ProfilesData } from '@inplayer-org/inplayer.js';
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useProfileStore } from '#src/stores/ProfileStore';
import type { CommonAccountResponse, ListProfilesResponse, ProfileDetailsPayload, ProfilePayload } from '#types/account';
import { useAccountStore } from '#src/stores/AccountStore';
import type { GenericFormErrors } from '#types/form';
import type { ProfileFormSubmitError, ProfileFormValues } from '#src/containers/Profiles/types';
import { logDev } from '#src/utils/common';
import ProfileController from '#src/stores/ProfileController';
import AccountController from '#src/stores/AccountController';
import { getModule } from '#src/modules/container';

export const useSelectProfile = () => {
  const navigate = useNavigate();

  const accountController = getModule(AccountController, false);
  const profileController = getModule(ProfileController, false);

  return useMutation(async (vars: { id: string; pin?: number; avatarUrl: string }) => profileController?.enterProfile({ id: vars.id, pin: vars.pin }), {
    onMutate: ({ avatarUrl }) => {
      useProfileStore.setState({ selectingProfileAvatar: avatarUrl });
    },
    onSuccess: async () => {
      useProfileStore.setState({ selectingProfileAvatar: null });
      navigate('/');
      await accountController?.loadUserData();
    },
    onError: () => {
      useProfileStore.setState({ selectingProfileAvatar: null });
      navigate('/u/profiles');
      logDev('Unable to enter profile');
    },
  });
};

export const useCreateProfile = (options?: UseMutationOptions<ServiceResponse<ProfilesData> | undefined, unknown, ProfilePayload, unknown>) => {
  const { query: listProfiles } = useProfiles();
  const navigate = useNavigate();

  const profileController = getModule(ProfileController, false);

  return useMutation<ServiceResponse<ProfilesData> | undefined, unknown, ProfilePayload, unknown>(async (data) => profileController?.createProfile(data), {
    onSuccess: (res) => {
      const profile = res?.responseData;
      if (profile?.id) {
        listProfiles.refetch();
        navigate(`/u/profiles?success=true&id=${profile.id}`);
      }
    },
    ...options,
  });
};

export const useUpdateProfile = (options?: UseMutationOptions<ServiceResponse<ProfilesData> | undefined, unknown, ProfilePayload, unknown>) => {
  const { query: listProfiles } = useProfiles();
  const navigate = useNavigate();

  const profileController = getModule(ProfileController, false);

  return useMutation(async (data) => profileController?.updateProfile(data), {
    onSuccess: () => {
      navigate('/u/profiles');
    },
    onSettled: () => {
      listProfiles.refetch();
    },
    ...options,
  });
};

export const useDeleteProfile = (options?: UseMutationOptions<ServiceResponse<CommonAccountResponse> | undefined, unknown, ProfileDetailsPayload, unknown>) => {
  const { query: listProfiles } = useProfiles();
  const navigate = useNavigate();

  const profileController = getModule(ProfileController, false);

  return useMutation<ServiceResponse<CommonAccountResponse> | undefined, unknown, ProfileDetailsPayload, unknown>(
    async (id) => profileController?.deleteProfile(id),
    {
      onSuccess: () => {
        listProfiles.refetch();
        navigate('/u/profiles');
      },
      ...options,
    },
  );
};

export const isProfileFormSubmitError = (e: unknown): e is ProfileFormSubmitError => !!e && typeof e === 'object' && 'message' in e;

export const useProfileErrorHandler = () => {
  const { t } = useTranslation('user');

  return (e: unknown, setErrors: (errors: Partial<ProfileFormValues & GenericFormErrors>) => void) => {
    if (isProfileFormSubmitError(e) && e.message.includes('409')) {
      setErrors({ name: t('profile.validation.name.already_exists') });
      return;
    }
    setErrors({ form: t('profile.form_error') });
  };
};

export const useProfiles = (
  options?: UseQueryOptions<ServiceResponse<ListProfilesResponse> | undefined, unknown, ServiceResponse<ListProfilesResponse> | undefined, string[]>,
) => {
  const { user } = useAccountStore();
  const { canManageProfiles } = useProfileStore();
  const isLoggedIn = !!user;

  const profileController = getModule(ProfileController, false);
  const accountController = getModule(AccountController, false);

  const { hasProfiles } = accountController?.getFeatures() || {};

  const query = useQuery(['listProfiles'], () => profileController?.listProfiles(), { ...options, enabled: isLoggedIn });

  return {
    query,
    profilesEnabled: !!(query.data?.responseData.canManageProfiles && hasProfiles && canManageProfiles),
  };
};
