import fs from 'fs';

import type { HtmlTagDescriptor } from 'vite';
import type { ManifestOptions } from 'vite-plugin-pwa';
import type { Target } from 'vite-plugin-static-copy';

const initSettings = (mode: string) => {
  const localFile = `ini/.webapp.${mode}.ini`;
  const templateFile = `ini/templates/.webapp.${mode}.ini`;

  // The build ONLY uses .ini files in /ini to include in the build output.
  // All .ini files in the directory are git ignored to customer specific values out of source control.
  // However, this script will automatically create a .ini file for the current mode if it doesn't exist
  // by copying the corresponding mode file from the ini/templates directory.
  if (!fs.existsSync(localFile) && fs.existsSync(templateFile)) {
    fs.copyFileSync(templateFile, localFile);
  }

  return localFile;
};

export const getFileCopyTargets = (mode: string): Target[] => {
  const localFile = initSettings(mode);
  const fileCopyTargets: Target[] = [
    {
      src: localFile,
      dest: '',
      rename: '.webapp.ini',
    },
  ];

  // These files are only needed in dev / test / demo, so don't include in prod builds
  if (mode !== 'prod') {
    fileCopyTargets.push({
      src: '../../packages/testing/epg/*',
      dest: 'epg',
    });
  }

  return fileCopyTargets;
};

export const getMetaTags = (tagData: Record<string, string | undefined>): HtmlTagDescriptor[] => {
  return Object.entries(tagData)
    .filter(([, value]) => !!value)
    .map(([name, content]) => ({
      tag: 'meta',
      injectTo: 'head',
      attrs: { name, content },
    }));
};

// @todo: move to common?
type ExternalFont = {
  resource: 'google' | 'system';
  fontFamily: string;
};

export const extractExternalFonts = (fontEnvVar: string = ''): ExternalFont[] => {
  if (!fontEnvVar) return [];

  return fontEnvVar.split(',').map((font) => {
    const [resource, fontFamily] = font.split(':');

    return { resource, fontFamily } as ExternalFont;
  });
};

export const getGoogleFontTags = (fonts: ExternalFont[]): HtmlTagDescriptor[] => {
  if (fonts.length === 0) return [];

  // Currently only supporting google fonts
  const uniqueFonts = makeFontsUnique(fonts);
  const googleFonts = uniqueFonts.filter(({ resource }) => resource === 'google').map(({ fontFamily }) => fontFamily);

  if (!googleFonts.length) return [];

  return createGoogleFontTags(googleFonts);
};

export const generateIconTags = (basePath: string, favIconSizes: number[], appleIconSizes: number[]) => {
  const favIconTags = favIconSizes.map((size) => {
    return `<link rel="icon" type="image/png" sizes="${size}x${size}" href="${basePath}pwa-${size}x${size}.png">`;
  });
  const appleIconTags = appleIconSizes.map((size) => {
    return `<link rel="apple-touch-icon" href="${basePath}apple-touch-icon-${size}x${size}.png">`;
  });
  return [...favIconTags, ...appleIconTags].join('\n');
};

export const getRelatedApplications = ({
  appleAppId,
  googleAppId,
}: {
  appleAppId?: string | undefined;
  googleAppId?: string | undefined;
} = {}): ManifestOptions['related_applications'] => {
  const relatedApplications = [];

  if (appleAppId) {
    relatedApplications.push({
      platform: 'itunes',
      url: `https://apps.apple.com/app/${appleAppId}`,
    });
  }

  if (googleAppId) {
    relatedApplications.push({
      platform: 'play',
      id: googleAppId,
      url: `https://play.google.com/store/apps/details?id=${googleAppId}`,
    });
  }

  return relatedApplications;
};

const makeFontsUnique = (arr: ExternalFont[]) => {
  const seen = new Set();

  return arr.filter((item) => {
    const key = item.fontFamily;
    return seen.has(key) ? false : seen.add(key);
  });
};

const createGoogleFontTags = (fontFamily: string[]) => {
  // Replace spaces with + for google font api
  const families = fontFamily.map((font) => `family=${font.replace(/\s/g, '+')}`).join('&');

  return [
    {
      tag: 'link',
      injectTo: 'head',
      attrs: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tag: 'link',
      injectTo: 'head',
      attrs: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
      },
    },
    {
      tag: 'link',
      injectTo: 'head',
      attrs: {
        href: `https://fonts.googleapis.com/css2?${families}&display=swap`,
        rel: 'stylesheet',
      },
    },
  ] as HtmlTagDescriptor[];
};

export const getGtmTags = (script: string, env: Record<string, string>) => {
  const tags: HtmlTagDescriptor[] = [];
  const enabled = env.APP_GTM_TAG_ID && env.APP_GTM_LOAD_ON_ACCEPT !== 'true';
  const tagServer = env.APP_GTM_TAG_SERVER || 'https://www.googletagmanager.com';

  // Load GTM immediately without waiting for consent. Consent should be handled by GTM.
  if (enabled && script) {
    if (tagServer.indexOf('www.googletagmanager.com') !== -1) {
      console.warn('GTM is loaded immediately from the Google domain. This may not be GDPR compliant.');
    }

    tags.push(
      {
        injectTo: 'head',
        tag: 'script',
        children: script,
      },
      {
        injectTo: 'body-prepend',
        tag: 'noscript',
        children: `<iframe src="${tagServer}/ns.html?id=${env.APP_GTM_TAG_ID}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      },
    );
  }

  return tags;
};

export const getGtmScript = (file: string, tagId: string, tagServer: string) => {
  if (!tagId) return '';
  const script = fs.readFileSync(file, 'utf-8');
  return script.replace('${tagServer}', tagServer || 'https://www.googletagmanager.com').replace('${tagId}', tagId);
};
