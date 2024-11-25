import type { PlaylistItem, Source } from '@jwp/ott-common/types/playlist';
import type { Config } from '@jwp/ott-common/types/config';
import type { Customer } from '@jwp/ott-common/types/account';
import { MANIFEST_TYPE } from '@jwp/ott-common/src/constants';

export const getSources = ({
  item,
  baseUrl,
  config,
  user,
  passport,
}: {
  item: PlaylistItem;
  baseUrl: string;
  config: Config;
  user: Customer | null;
  passport: string | null;
}) => {
  const { sources, mediaid } = item;
  const { adConfig, siteId, adDeliveryMethod } = config;

  const userId = user?.id;
  const hasServerAds = !!adConfig && adDeliveryMethod === 'ssai';

  return sources.map((source: Source) => {
    const url = new URL(source.file);

    const isDRM = (url.searchParams.has('exp') && url.searchParams.has('sig')) || source.drm;

    // Use SSAI URL for configs with server side ads, DRM is not supported yet
    if (hasServerAds && !isDRM) {
      url.href = `${baseUrl}/v2/sites/${siteId}/media/${mediaid}/ssai.${MANIFEST_TYPE.dash === source.type ? 'mpd' : 'm3u8'}`;
      url.searchParams.set('ad_config_id', adConfig);
    }

    // Attach user_id for VOD and BCL SaaS Live Streams
    if (userId) {
      url.searchParams.set('user_id', userId);
    }

    // Attach the passport in all the drm sources as it's needed for the licence request.
    // Passport is only available if Access Bridge is in use.
    if (passport) {
      attachPassportToSourceWithDRM(source, passport);
    }

    source.file = url.toString();

    return source;
  });
};

function attachPassportToSourceWithDRM(source: Source, passport: string): Source {
  function updateUrl(urlString: string, passport: string): string {
    const url = new URL(urlString);
    if (!url.searchParams.has('token')) {
      url.searchParams.set('passport', passport);
    }
    return url.toString();
  }

  if (source?.drm) {
    if (source.drm?.playready?.url) {
      source.drm.playready.url = updateUrl(source.drm.playready.url, passport);
    }
    if (source.drm?.widevine?.url) {
      source.drm.widevine.url = updateUrl(source.drm.widevine.url, passport);
    }
    if (source.drm?.fairplay?.processSpcUrl) {
      source.drm.fairplay.processSpcUrl = updateUrl(source.drm.fairplay.processSpcUrl, passport);
    }
  }

  return source;
}
