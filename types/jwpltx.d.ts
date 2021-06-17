interface Jwpltx {
  ready: (analyticsId: string, hostname: string, feedid: string, mediaid: string, title: string) => void;
  adImpression: () => void;
  time: (position: number, duration: number) => void;
  complete: () => void;
}
