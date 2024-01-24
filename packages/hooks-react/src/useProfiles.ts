import type { ProfilesData } from '@inplayer-org/inplayer.js';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from 'react-query';
import { useTranslation } from 'react-i18next';
import type { GenericFormErrors } from '@jwp/ott-common/types/form';
import type { CommonAccountResponse, ListProfilesResponse, ProfileDetailsPayload, ProfilePayload } from '@jwp/ott-common/types/account';
import type { ProfileFormSubmitError, ProfileFormValues } from '@jwp/ott-common/types/profiles';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useProfileStore } from '@jwp/ott-common/src/stores/ProfileStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import ProfileController from '@jwp/ott-common/src/stores/ProfileController';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import { logDev } from '@jwp/ott-common/src/utils/common';
import type { ServiceResponse } from '@jwp/ott-common/types/service';

export const useSelectProfile = (options?: { onSuccess: () => void; onError: () => void }) => {
  const accountController = getModule(AccountController, false);
  const profileController = getModule(ProfileController, false);

  return useMutation(async (vars: { id: string; pin?: number; avatarUrl: string }) => profileController?.enterProfile({ id: vars.id, pin: vars.pin }), {
    onMutate: ({ avatarUrl }) => {
      useProfileStore.setState({ selectingProfileAvatar: avatarUrl });
    },
    onSuccess: async () => {
      useProfileStore.setState({ selectingProfileAvatar: null });
      await accountController?.loadUserData();
      options?.onSuccess?.();
    },
    onError: () => {
      useProfileStore.setState({ selectingProfileAvatar: null });
      logDev('Unable to enter profile');
      options?.onError?.();
    },
  });
};

export const useCreateProfile = (options?: UseMutationOptions<ServiceResponse<ProfilesData> | undefined, unknown, ProfilePayload, unknown>) => {
  const { query: listProfiles } = useProfiles();

  const profileController = getModule(ProfileController, false);

  return useMutation<ServiceResponse<ProfilesData> | undefined, unknown, ProfilePayload, unknown>(async (data) => profileController?.createProfile(data), {
    ...options,
    onSuccess: (data, variables, context) => {
      listProfiles.refetch();

      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useUpdateProfile = (options?: UseMutationOptions<ServiceResponse<ProfilesData> | undefined, unknown, ProfilePayload, unknown>) => {
  const { query: listProfiles } = useProfiles();

  const profileController = getModule(ProfileController, false);

  return useMutation(async (data) => profileController?.updateProfile(data), {
    ...options,
    onSettled: (...args) => {
      listProfiles.refetch();

      options?.onSettled?.(...args);
    },
  });
};

export const useDeleteProfile = (options?: UseMutationOptions<ServiceResponse<CommonAccountResponse> | undefined, unknown, ProfileDetailsPayload, unknown>) => {
  const { query: listProfiles } = useProfiles();

  const profileController = getModule(ProfileController, false);

  return useMutation<ServiceResponse<CommonAccountResponse> | undefined, unknown, ProfileDetailsPayload, unknown>(
    async (id) => profileController?.deleteProfile(id),
    {
      ...options,
      onSuccess: (...args) => {
        listProfiles.refetch();

        options?.onSuccess?.(...args);
      },
    },
  );
};

export const isProfileFormSubmitError = (e: unknown): e is ProfileFormSubmitError => {
  return !!e && typeof e === 'object' && 'message' in e;
};

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
  const isLoggedIn = !!user;

  const profileController = getModule(ProfileController);

  const profilesEnabled = profileController.isEnabled();

  const query = useQuery(['listProfiles'], () => profileController.listProfiles(), {
    ...options,
    enabled: isLoggedIn && profilesEnabled,
  });

  return {
    query,
    profilesEnabled: !!query.data?.responseData.canManageProfiles,
  };
};
