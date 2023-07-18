import type { ProfilePayload } from '#types/account';

export type ProfileFormValues = Omit<ProfilePayload, 'adult'> & { adult: string };
