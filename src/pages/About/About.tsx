import React from 'react';

import styles from './About.module.scss';

import MarkdownComponent from '#components/MarkdownComponent/MarkdownComponent';

const About = () => {
  const markdownPage = `# About JW OTT Webapp
  
JW OTT Webapp is an open-source, dynamically generated video website built around JW Player and JW Platform services. It enables you to easily publish your JW Player-hosted video content with no coding and minimal configuration.

To see an example of JW OTT Webapp in action, see [https://app-preview.jwplayer.com/](https://app-preview.jwplayer.com/).

## Supported Features

- Works with any JW Player edition, from Free to Enterprise (note that usage will count against your monthly JW streaming limits). Only cloud-hosted JW Players are supported.
- It looks great on any device. The responsive UI automatically optimizes itself for desktop, tablet, and mobile screens.
- Populates your site's media content using JSON feeds. If you are using JW Platform, this happens auto-magically based on playlists that you specify. Using feeds from other sources will require you to hack the source code.
- Video titles, descriptions and hero images are populated from JW Platform JSON feed metadata.
- Playback of HLS video content from the JW Platform CDN. You can add external URLs (for example, URLS from your own server or CDN) to your playlists in the Content section of your JW Player account dashboard, but they must be HLS streams (\`.m3u8\` files).
- Support for live video streams (must be registered as external .m3u8 URLs in your JW Dashboard).
- Customize the user interface with your own branding. The default app is configured for JW Player branding and content, but you can easily change this to use your own assets by modifying the \`config.json\` file. Advanced customization is possible (for example, editing the CSS files), but you will need to modify the source code and build from source.
- Site-wide video search and related video recommendations powered by [JW Recommendations](https://docs.jwplayer.com/platform/docs/vdh-learn-about-recommendations).
- Basic playback analytics is reported to your JW Dashboard.
- Ad integrations (VAST, VPAID, GoogleIMA, etc.). These features require a JW Player Ads Edition license. For more information, see the [JW Player pricing page](https://www.jwplayer.com/pricing/).
- A "Favorites" feature for users to save videos for watching later. A separate list for "Continue Watching" is also kept so users can resume watching videos from where they left off. The lists are per-browser at this time (i.e., lists do not sync across user's browsers or devices). The "Continue Watching" list can be disabled in your JW OTT Webapp's \`config.json\` file.
- A grid view for a particular playlist of videos, with the ability to deep-link to the playlist through a static URL.
- Social sharing options using the device native sharing dialog.

## Unsupported Features

- Security-related features (encrypted HLS, DRM, signed URLs)
- Self-hosted JW Players`;

  return <MarkdownComponent className={styles.about} markdownString={markdownPage} />;
};

export default About;
