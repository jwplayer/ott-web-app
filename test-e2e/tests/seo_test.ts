import constants from '#utils/constants';
import { testConfigs } from '#test/constants';

Feature('seo').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
});

Scenario('It renders the correct meta tags for the home screen', ({ I }) => {
  I.seeTitleEquals('JW OTT Web App');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'JW Player OTT Web App demo' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'JW OTT Web App' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'JW Player OTT Web App demo' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'JW OTT Web App' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'JW Player OTT Web App demo' });
});

Scenario('It renders the correct meta tags for the playlist screen', async ({ I }) => {
  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Films');
  I.seeTitleEquals('All Films - JW OTT Web App');

  I.seeAttributesOnElements('meta[name="description"]', { content: 'JW Player OTT Web App demo' });

  I.seeAttributesOnElements('meta[property="og:title"]', { content: 'All Films - JW OTT Web App' });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: 'JW Player OTT Web App demo' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: 'All Films - JW OTT Web App' });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: 'JW Player OTT Web App demo' });
});

Scenario('It renders the correct meta tags for the movie screen', async ({ I }) => {
  await I.openVideoCard(constants.agent327Title);
  await checkMetaTags(I, constants.agent327Title, constants.agent327Description, false);
});

Scenario('It renders the correct structured metadata for the movie screen', async ({ I }) => {
  await I.openVideoCard(constants.agent327Title);

  const url = removeQueryParam(await I.grabCurrentUrl(), 'r');

  I.seeTextEquals(
    JSON.stringify({
      '@context': 'http://schema.org/',
      '@type': 'VideoObject',
      '@id': url,
      name: constants.agent327Title,
      description: constants.agent327Description,
      duration: 'PT3M51S',
      thumbnailUrl: makeHttps(getPosterUrl(url)),
      uploadDate: '2021-01-16T20:15:00.000Z',
    }),
    { css: 'script[type="application/ld+json"]' },
  );
});

Scenario('It renders the correct meta tags for the series screen', async ({ I }) => {
  await I.openVideoCard(constants.primitiveAnimalsTitle);
  I.see('Primitive Animals');

  await checkMetaTags(I, 'Blocking', constants.primitiveAnimalsDescription, true);
});

Scenario('It renders the correct structured metadata for the series screen', async ({ I }) => {
  await I.openVideoCard(constants.primitiveAnimalsTitle);
  I.see('Primitive Animals');

  const url = await I.grabCurrentUrl();
  const seriesId = getQueryParam(url, 'seriesId');

  I.seeTextEquals(
    JSON.stringify({
      '@context': 'http://schema.org/',
      '@type': 'TVEpisode',
      '@id': removeQueryParam(url, 'r'),
      episodeNumber: '1',
      seasonNumber: '1',
      name: 'Blocking',
      uploadDate: '2021-03-10T10:00:00.000Z',
      partOfSeries: {
        '@type': 'TVSeries',
        '@id': `${constants.baseUrl}s/${seriesId}`,
        name: 'Primitive Animals',
        numberOfEpisodes: 4,
        numberOfSeasons: 1,
      },
    }),
    { css: 'script[type="application/ld+json"]' },
  );
});

async function checkMetaTags(I: CodeceptJS.I, title: string, description, isSeries: boolean) {
  I.seeTitleEquals(`${title} - JW OTT Web App`);

  I.seeAttributesOnElements('meta[name="description"]', { content: description });

  const url = removeQueryParam(await I.grabCurrentUrl(), 'r');
  const posterUrl = getPosterUrl(url);
  I.seeAttributesOnElements('meta[property="og:title"]', { content: `${title} - JW OTT Web App` });
  I.seeAttributesOnElements('meta[property="og:description"]', { content: description });
  I.seeAttributesOnElements('meta[property="og:type"]', { content: isSeries ? 'video.episode' : 'video.other' });
  I.seeAttributesOnElements('meta[property="og:image"]', { content: posterUrl });
  I.seeAttributesOnElements('meta[property="og:image:secure_url"]', { content: makeHttps(posterUrl) });
  I.seeAttributesOnElements('meta[property="og:image:width"]', { content: '720' });
  I.seeAttributesOnElements('meta[property="og:image:height"]', { content: '406' });

  I.seeAttributesOnElements('meta[property="og:video"]', { content: url });
  I.seeAttributesOnElements('meta[property="og:video:secure_url"]', { content: makeHttps(url) });
  I.seeAttributesOnElements('meta[property="og:video:type"]', { content: 'text/html' });
  I.seeAttributesOnElements('meta[property="og:video:width"]', { content: '1280' });
  I.seeAttributesOnElements('meta[property="og:video:height"]', { content: '720' });

  I.seeAttributesOnElements('meta[name="twitter:title"]', { content: `${title} - JW OTT Web App` });
  I.seeAttributesOnElements('meta[name="twitter:description"]', { content: description });
  I.seeAttributesOnElements('meta[name="twitter:image"]', { content: makeHttps(posterUrl) });
}

function removeQueryParam(href: string, param: string) {
  const url = new URL(href);
  url.searchParams.delete(param);
  return url.toString();
}

function getQueryParam(href: string, param: string) {
  const url = new URL(href);
  return url.searchParams.get(param);
}

function makeHttps(href: string) {
  const url = new URL(href);
  url.protocol = 'https';
  return url.toString();
}

function getPosterUrl(href: string) {
  const url = new URL(href);
  const mediaId = url.pathname.split('/')[2];

  return `http://cdn.jwplayer.com/v2/media/${mediaId}/poster.jpg?width=720`;
}
