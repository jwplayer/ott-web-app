interface Jwpltx {
  ready: (analyticsId: string, hostname: string, feedid: string, mediaid: string, title: string) => void;
  adImpression: () => void;
  seek: (offset: number, duration: number) => void;
  seeked: () => void;
  time: (position: number, duration: number, feedid?: string | null | undefined) => void;
  complete: () => void;
  remove: () => void;
}
