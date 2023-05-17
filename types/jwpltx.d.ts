interface Jwpltx {
  ready: (analyticsId: string, hostname: string, feedid: string, mediaid: string, title: string, appAccountId?: number) => void;
  adImpression: () => void;
  seek: (offset: number, duration: number) => void;
  seeked: () => void;
  time: (position: number, duration: number) => void;
  complete: () => void;
  remove: () => void;
}
