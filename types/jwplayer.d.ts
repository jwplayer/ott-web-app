import '@types/jwplayer';

// missing events in typings
interface EventParams extends jwplayer.EventParams {
  userActive: () => void;
  userInactive: () => void;
  nextClick: () => void;
  pipEnter: () => void;
  pipLeave: () => void;
}

type ConfigOptions = {
  aspectratio?: string;
  autostart: boolean | 'viewable';
  height?: number | string;
  width?: number | string;
  mute?: boolean;
  repeat?: boolean;
  stretching?: 'uniform' | 'exactfit' | 'fill' | 'none';
  volume?: number;
};

export type JWPlayer = jwplayer.JWPlayer & {
  on<TEvent extends keyof EventParams>(event: TEvent, callback: jwplayer.EventCallback<EventParams[TEvent]>): JWPlayer;
  on(event: jwplayer.NoParamEvent, callback: () => void): JWPlayer;
  once<TEvent extends keyof EventParams>(event: TEvent, callback: jwplayer.EventCallback<EventParams[TEvent]>): JWPlayer;
  once(event: jwplayer.NoParamEvent, callback: () => void): JWPlayer;
  off(event: keyof EventParams | jwplayer.NoParamEvent): JWPlayer;
  off(event: jwplayer.NoParamEvent, callback: () => void): JWPlayer;
  off<TEvent extends keyof EventParams>(event: TEvent, callback: jwplayer.EventCallback<EventParams[TEvent]>): JWPlayer;
  setConfig(config: ConfigOptions);
  setPlaylistItemCallback(callback?: (item: never) => Promise<unknown>): void;
  removePlaylistItemCallback(): void;
};
