export type AccountDetails = {
  id: string;
  email: string;

  profile: {
    firstName: string | undefined;
    lastName: string | undefined;
  }
};
