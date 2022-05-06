export const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

let size: number;

export function getPublicUrl(url: string) {
  if (url.startsWith('http')) {
    return url;
  }

  const baseUrl = import.meta.env.APP_GITHUB_PUBLIC_BASE_URL || '';
  const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, '');

  return (baseUrl ? '/' : '') + [baseUrl, url].map(trimSlashes).join('/');
}

export default function scrollbarSize(recalc?: boolean) {
  if ((!size && size !== 0) || recalc) {
    if (canUseDOM) {
      const scrollDiv = document.createElement('div');

      scrollDiv.style.position = 'absolute';
      scrollDiv.style.top = '-9999px';
      scrollDiv.style.width = '50px';
      scrollDiv.style.height = '50px';
      scrollDiv.style.overflow = 'scroll';

      document.body.appendChild(scrollDiv);
      size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
    }
  }

  return size;
}
