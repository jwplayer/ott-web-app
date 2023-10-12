import type { ProfilesData } from '@inplayer-org/inplayer.js';
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { createProfile, deleteProfile, enterProfile, listProfiles, updateProfile } from '#src/stores/ProfileController';
import { useProfileStore } from '#src/stores/ProfileStore';
import type { CommonAccountResponse, ListProfilesResponse, ProfileDetailsPayload, ProfilePayload } from '#types/account';
import { useAccountStore } from '#src/stores/AccountStore';
import type { GenericFormErrors } from '#types/form';
import type { ProfileFormSubmitError, ProfileFormValues } from '#src/containers/Profiles/types';
import { logDev } from '#src/utils/common';

export const useSelectProfile = () => {
  const navigate = useNavigate();

  return useMutation((vars: { id: string; pin?: number; avatarUrl: string }) => enterProfile({ id: vars.id, pin: vars.pin }), {
    onMutate: ({ avatarUrl }) => {
      useProfileStore.setState({ selectingProfileAvatar: avatarUrl });
    },
    onSuccess: async () => {
      useProfileStore.setState({ selectingProfileAvatar: null });
      navigate('/');
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

  return useMutation<ServiceResponse<ProfilesData> | undefined, unknown, ProfilePayload, unknown>(createProfile, {
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

  return useMutation(updateProfile, {
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

  return useMutation<ServiceResponse<CommonAccountResponse> | undefined, unknown, ProfileDetailsPayload, unknown>(deleteProfile, {
    onSuccess: () => {
      listProfiles.refetch();
      navigate('/u/profiles');
    },
    ...options,
  });
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
  const user = useAccountStore((s) => s.user);
  const { canManageProfiles } = useAccountStore();
  const query = useQuery(['listProfiles'], listProfiles, { ...options, enabled: !!user });

  return {
    query,
    profilesEnabled: !!(query.data?.responseData.canManageProfiles && canManageProfiles),
  };
};
