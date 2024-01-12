module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'project',
        'home',
        'playlist',
        'videodetail',
        'player',
        'series',
        'search',
        'user',
        'watchhistory',
        'favorites',
        'profiles',
        'analytics',
        'pwa',
        'seo',
        'auth',
        'menu',
        'payment',
        'e2e',
        'signing',
        'entitlement',
        'inlineplayer',
        'config',
        'epg',
        'tests',
        'i18n',
      ],
    ],
  },
};
