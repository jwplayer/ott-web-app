export type ProfileFormValues = Omit<ProfilePayload, 'adult'> & { adult: string };
