export type JWPlayer = jwplayer.JWPlayer & {
  on(event: 'userActive' | 'userInactive', callback: () => void);
};
