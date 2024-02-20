import { defineConfig, type Preset } from '@vite-pwa/assets-generator/config';

export const favIconSizes = [196, 192, 160, 144, 96, 64, 32, 16];
export const appleIconSizes = [180, 152, 144, 120, 114, 76, 72, 60];
export const basePath = '/images/icons/';

export const ottPresetNoPadding: Preset = {
  transparent: {
    sizes: favIconSizes,
    favicons: [[48, 'favicon.ico']],
    padding: 0,
  },
  maskable: {
    sizes: [],
    padding: 0,
  },
  apple: {
    sizes: appleIconSizes,
    padding: 0,
  },
};

export default defineConfig({
  images: './public/images/icons/app-icon.png', // Source image
  preset: ottPresetNoPadding,
  headLinkOptions: {
    basePath: basePath,
  },
});
