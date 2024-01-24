import type { ProfilePayload } from './account';

export type ProfileFormValues = Omit<ProfilePayload, 'adult'> & { adult: string };

export type ProfileFormSubmitError = {
  code: number;
  message: string;
};
