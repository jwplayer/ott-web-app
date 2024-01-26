// noinspection JSUnusedGlobalSymbols
interface Window {
  jwplayer?: jwplayer.JWPlayerStatic;
  jwpltx: Jwpltx;
}

interface HTMLDivElement {
  inert: boolean;
}

type OTTConfig = {
  name: string;
  shortname: string;
  description: string;
};
