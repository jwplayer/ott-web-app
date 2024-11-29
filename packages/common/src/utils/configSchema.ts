import { array, boolean, number, object, type ObjectSchema, string } from 'yup';

import type { Cleeng, Config, Content, Features, JWP, Menu, Styling } from '../../types/config';

const contentSchema: ObjectSchema<Content> = object({
  contentId: string().optional(),
  title: string().optional(),
  featured: boolean().optional(),
  backgroundColor: string().nullable().optional(),
  type: string().oneOf(['playlist', 'continue_watching', 'favorites', 'content_list']).required(),
  custom: object().optional(),
}).defined();

const menuSchema: ObjectSchema<Menu> = object().shape({
  label: string().defined(),
  contentId: string().defined(),
  filterTags: string().optional(),
  type: string().oneOf(['playlist', 'content_list', 'media']).optional(),
  custom: object().optional(),
});

const featuresSchema: ObjectSchema<Features> = object({
  recommendationsPlaylist: string().nullable(),
  searchPlaylist: string().nullable(),
  continueWatchingList: string().nullable(),
  favoritesList: string().nullable(),
});

const cleengSchema: ObjectSchema<Cleeng> = object({
  id: string().nullable(),
  monthlyOffer: string().nullable(),
  yearlyOffer: string().nullable(),
  useSandbox: boolean().default(true),
});

const jwpSchema: ObjectSchema<JWP> = object({
  clientId: string().nullable(),
  assetId: number().nullable(),
  useSandbox: boolean().default(true),
});

const stylingSchema: ObjectSchema<Styling> = object({
  backgroundColor: string().nullable(),
  highlightColor: string().nullable(),
  headerBackground: string().nullable(),
  footerText: string().nullable(),
});

export const configSchema: ObjectSchema<Config> = object({
  id: string().optional(),
  siteName: string().optional(),
  description: string().defined(),
  analyticsToken: string().notRequired(),
  adConfig: string().notRequired(),
  adSchedule: string().notRequired(),
  adScheduleUrls: object({
    json: string().notRequired().nullable(),
    xml: string().notRequired().nullable(),
  }).optional(),
  adDeliveryMethod: string().oneOf(['csai', 'ssai']).optional(),
  siteId: string().defined(),
  assets: object({
    banner: string().notRequired(),
  }),
  content: array().of(contentSchema).defined(),
  menu: array().of(menuSchema).defined(),
  styling: stylingSchema.notRequired(),
  features: featuresSchema.notRequired(),
  integrations: object({
    cleeng: cleengSchema.optional(),
    jwp: jwpSchema.optional(),
  }),
  custom: object().notRequired(),
  contentSigningService: object().shape({
    host: string().required(),
    drmPolicyId: string().optional(),
  }),
  contentProtection: object()
    .shape({
      accessModel: string().oneOf(['free', 'freeauth', 'authvod', 'svod']).defined(),
      drm: object({
        defaultPolicyId: string().defined(),
      }).optional(),
    })
    .optional(),
}).defined();
