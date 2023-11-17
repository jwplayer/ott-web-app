import type { ProfilePayload } from '@jwplayer/ott-common/types/account';

export type ProfileFormValues = Omit<ProfilePayload, 'adult'> & { adult: string };

export type ProfileFormSubmitError = {
  code: number;
  message: string;
};
