export type JWPlayer = jwplayer.JWPlayer & {
  on(event: 'userActive' | 'userInactive', callback: () => void);
  off(event: 'userActive' | 'userInactive', callback: () => void);
  setConfig({ playlist, autostart });
};
