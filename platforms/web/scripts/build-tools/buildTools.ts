import fs from 'fs';

import type { HtmlTagDescriptor } from 'vite';
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

export const getGoogleVerificationTag = (env: Record<string, string>): HtmlTagDescriptor[] => {
  if (!env.APP_GOOGLE_SITE_VERIFICATION_ID) return [];

  return [
    {
      tag: 'meta',
      injectTo: 'head',
      attrs: {
        content: process.env.APP_GOOGLE_SITE_VERIFICATION_ID,
        name: 'google-site-verification',
      },
    },
  ];
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

  return createGoogleFontTags(googleFonts);
};

export const generateIconTags = (basePath: string, favIconSizes: number[], appleIconSizes: number[]) => {
  const favIconTags = favIconSizes.map((size) => {
    return `<link rel="icon" type="image/png" sizes="${size}x${size}" href="${basePath}/favicon-${size}x${size}.png">`;
  });
  const appleIconTags = appleIconSizes.map((size) => {
    return `<link rel="apple-touch-icon" href="${basePath}/apple-touch-icon-${size}x${size}.png">`;
  });
  return [...favIconTags, ...appleIconTags].join('\n');
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

export const getGtmTags = (env: Record<string, string>) => {
  const tags: HtmlTagDescriptor[] = [];

  if (env.APP_GTM_TAG_ID) {
    tags.push(
      {
        injectTo: 'head',
        tag: 'script',
        children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${env.APP_GTM_TAG_ID}');`,
      },
      {
        injectTo: 'body-prepend',
        tag: 'noscript',
        children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${env.APP_GTM_TAG_ID}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      },
    );
  }

  return tags;
};
