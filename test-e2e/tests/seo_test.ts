import constants from '../utils/constants';

const agent327PosterUrl = `http://cdn.jwplayer.com/v2/media/uB8aRnu6/poster.jpg?width=720`;
const primitiveAnimalsDescription = "If you're brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.";
const primitiveAnimalsPosterUrl = `http://cdn.jwplayer.com/v2/media/zKT3MFut/poster.jpg?width=720`;

Feature('seo').retry(3);

Scenario('It renders the correct meta tags for the home screen', ({ I }) => {
  I.amOnPage(constants.baseUrl);
  I.seeInTitle('Blender');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'Blender demo site' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'Blender' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'Blender demo site' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'Blender' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'Blender demo site' });
});

Scenario('It renders the correct meta tags for the playlist screen', ({ I }) => {
  I.amOnPage(constants.filmsPlaylistUrl);
  I.seeInTitle('All Films - Blender');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'Blender demo site' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'All Films - Blender' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'Blender demo site' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'All Films - Blender' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'Blender demo site' });
});

Scenario('It renders the correct meta tags for the movie screen', ({ I }) => {
  I.amOnPage(constants.agent327DetailUrl);
  I.seeInTitle('Agent 327 - Blender');

  I.seeAttributesOnElements('meta[name="description"]', { content: constants.agent327Description });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'Agent 327 - Blender' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: constants.agent327Description });
  I.seeAttributesOnElements('meta[property="og:type"]', { content: 'video.other' });
  I.seeAttributesOnElements('meta[property="og:image"]', { content: agent327PosterUrl });
  I.seeAttributesOnElements('meta[property="og:image:secure_url"]', { content: makeHttps(agent327PosterUrl) });
  I.seeAttributesOnElements('meta[property="og:image:width"]', { content: '720' });
  I.seeAttributesOnElements('meta[property="og:image:height"]', { content: '406' });

  const url = removeQueryString(constants.agent327DetailUrl);
  I.seeAttributesOnElements('meta[property="og:video"]', { content: url });
  I.seeAttributesOnElements('meta[property="og:video:secure_url"]', { content: makeHttps(url) });
  I.seeAttributesOnElements('meta[property="og:video:type"]', { content: 'text/html' });
  I.seeAttributesOnElements('meta[property="og:video:width"]', { content: '1280' });
  I.seeAttributesOnElements('meta[property="og:video:height"]', { content: '720' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'Agent 327 - Blender' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: constants.agent327Description });
  I.seeAttributesOnElements('meta[name="twitter:image"]', { content: makeHttps(agent327PosterUrl) });
});

Scenario('It renders the correct structured metadata for the movie screen', ({ I }) => {
  I.amOnPage(removeQueryString(constants.agent327DetailUrl));
  I.seeTextEquals(
    JSON.stringify({
      '@context': 'http://schema.org/',
      '@type': 'VideoObject',
      '@id': removeQueryString(constants.agent327DetailUrl),
      name: 'Agent 327',
      description: constants.agent327Description,
      duration: 'PT3M51S',
      thumbnailUrl: makeHttps(agent327PosterUrl),
      uploadDate: '2021-01-16T20:15:00.000Z',
    }),
    { css: 'script[type="application/ld+json"]' },
  );
});

Scenario('It renders the correct meta tags for the series screen', ({ I }) => {
  I.amOnPage(constants.primitiveAnimalsDetailUrl);
  I.seeInTitle('Blocking - Blender');

  I.seeAttributesOnElements('meta[name="description"]', { content: primitiveAnimalsDescription });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'Blocking - Blender' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: primitiveAnimalsDescription });
  I.seeAttributesOnElements('meta[property="og:type"]', { content: 'video.episode' });

  I.seeAttributesOnElements('meta[property="og:image"]', { content: primitiveAnimalsPosterUrl });
  I.seeAttributesOnElements('meta[property="og:image:secure_url"]', { content: makeHttps(primitiveAnimalsPosterUrl) });
  I.seeAttributesOnElements('meta[property="og:image:width"]', { content: '720' });
  I.seeAttributesOnElements('meta[property="og:image:height"]', { content: '406' });

  I.seeAttributesOnElements('meta[property="og:video"]', { content: constants.primitiveAnimalsDetailUrl });
  I.seeAttributesOnElements('meta[property="og:video:secure_url"]', { content: makeHttps(constants.primitiveAnimalsDetailUrl) });
  I.seeAttributesOnElements('meta[property="og:video:type"]', { content: 'text/html' });
  I.seeAttributesOnElements('meta[property="og:video:width"]', { content: '1280' });
  I.seeAttributesOnElements('meta[property="og:video:height"]', { content: '720' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'Blocking - Blender' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: primitiveAnimalsDescription });
  I.seeAttributesOnElements('meta[name="twitter:image"]', { content: makeHttps(primitiveAnimalsPosterUrl) });
});

Scenario('It renders the correct structured metadata for the series screen', ({ I }) => {
  I.amOnPage(constants.primitiveAnimalsDetailUrl);
  I.seeTextEquals(
    JSON.stringify({
      '@context': 'http://schema.org/',
      '@type': 'TVEpisode',
      '@id': constants.primitiveAnimalsDetailUrl,
      episodeNumber: '1',
      seasonNumber: '1',
      name: 'Blocking',
      uploadDate: '2021-03-10T10:00:00.000Z',
      partOfSeries: {
        '@type': 'TVSeries',
        '@id': removeQueryString(constants.primitiveAnimalsDetailUrl),
        name: 'Primitive Animals',
        numberOfEpisodes: 4,
        numberOfSeasons: 1,
      },
    }),
    { css: 'script[type="application/ld+json"]' },
  );
});

function removeQueryString(href: string) {
  const url = new URL(href);
  url.search = '';
  return url.toString();
}

function makeHttps(href: string) {
  const url = new URL(href);
  url.protocol = 'https';
  return url.toString();
}
