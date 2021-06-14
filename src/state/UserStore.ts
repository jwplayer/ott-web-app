import { Store } from 'pullstate';

type User = {
  name: string;
};

type UserStore = {
  user: User;
};

export const UserStore = new Store<UserStore>({
  user: {
    name: '',
  },
});
