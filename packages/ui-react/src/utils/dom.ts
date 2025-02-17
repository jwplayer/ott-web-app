export const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

let size: number;

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

export const addScript = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const script: HTMLScriptElement = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (error) => {
      console.info('Error loading external script', error);
      throw new Error('Error loading external script');
    };
    document.body.appendChild(script);
  });
};

export const injectScript = (script: string) => {
  if (!script) return;

  const scriptElement = document.createElement('script');
  scriptElement.type = 'text/javascript';
  scriptElement.textContent = script;

  document.head.appendChild(scriptElement);
};
