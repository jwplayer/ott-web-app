import { defineConfig, defaultAssetName, type Preset, type AssetType, type ResolvedAssetSize } from '@vite-pwa/assets-generator/config';

export const ottPresetNoPadding: Preset = {
  transparent: {
    sizes: [196, 192, 160, 144, 96, 64, 32, 16],
    favicons: [[48, 'favicon.ico']],
    padding: 0,
  },
  maskable: {
    sizes: [],
    padding: 0,
  },
  apple: {
    sizes: [180, 152, 144, 120, 114, 76, 72, 60],
    padding: 0,
  },
};

export default defineConfig({
  images: './public/images/icons/app-icon.png', // Source image
  preset: ottPresetNoPadding,
  headLinkOptions: {
    basePath: '/images/icons/',
  },
});
