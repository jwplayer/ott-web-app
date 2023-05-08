# Configuration

The JW OTT Webapp is designed to consume a json configuration file served by the [JWP Delivery API](https://docs.jwplayer.com/platform/reference/get_apps-configs-config-id-json).
The easiest way to maintain configuration files is to use the 'Apps' section in your [JWP Dashboard account](https://dashboard.jwplayer.com/).

## Configuration File Source

Which app config file the application uses is determined by the [ini file](initialization-file.md).

You can specify the default that the application starts with and also which config, if any, it will allow to be set using the [`app-config=<config source>` query param](#switching-between-app-configs).
The location is usually specified by the 8-character ID (i.e. `gnnuzabk`) of the App Config from your JWP account, in which case the file will be loaded from the JW Player App Config delivery endpoint (i.e. `https://cdn.jwplayer.com/apps/configs/gnnuzabk.json`).
You may also specify a relative or absolute URL.

### Switching between app configs

As mentioned above, if you have 1 or more additional allowed sources (see additionalAllowedConfigSources in [`initialization-file`](initialization-file.md)), you can switch between them by adding `app-config=<config source>` as a query parameter in the web app URL in your browser (i.e. `https://<your domain>/?app-config=gnnuzabk`).

The parameter is automatically evaluated, loaded, and stored in browser session storage and should remain part of the url as the user navigates around the site.

> _Note: Be aware that this mechanism only sets the config for the local machine, browser, and session that you are accessing the site with and it does not change the default hosted app for other users._

Even sharing URL's should work as long as the query parameter of the desired config is part of the URL. However, once the query parameter is removed and the stored value in the session is released, the application will revert to loading the default config source.

> _Note: to clear the value from session storage and return to the default, you can navigate to the site with a blank query parameter value (i.e. `?app-config=`)_

## Available Configuration Parameters

These are the available configuration parameters for the JW OTT Webapp's config.json file.

**siteName**

Title of your website. JW OTT Webapp will automatically update the `<title>` tag of your site to this value when the site loads. If **siteName** is not set, the default name `My OTT Application` will be used.

---

**description**

Short description of your website. JW OTT Webapp will automatically update the `<meta name='description'>` tag in your site to this value, which can help to improve your site's search engine performance.

---

**analyticsToken** (optional)

Analytics token for the JW Player's OTT Analytics feature.

---

**assets.banner** (optional)

Location of a JPG, PNG or GIF image to be used as the logo in the header (e.g. **/images/logo.png**).

---

**menu**

Use the `menu` array to define the links that are visible in the header and menu on mobile devices.

```
{
  "menu": [{
    "label": "Movies",
    "contentId": "lrYLc95e",
    "filterTags": "Action,Comedy,Drama"
    "type": "playlist"
  }, {
    "label": "Series",
    "contentId": "lrYLc95e"
    "type": "playlist"
  }]
}
```

---

**menu[].label**

The label is what the user sees in the header and sidebar.

---

**menu[].contentId**

The eight-character Playlists IDs from the JW Player dashboard. These IDs populate the grid when the user navigates to the given screen.

---

**menu[].filterTags** (optional)

You can optionally define a list of comma separated tags which are used in the "filters" section on the screen.

---

**content**

Use the `content` array to define which and how content playlists should be displayed in "shelves". For optimal performance and user experience, we recommend a maximum of 10 playlists. See the available options below to configure each shelf separately.

```
{
  content: [{
    "contentId": "lrYLc95e",
    "featured": true
    "type": "playlist"
  }, {
    "type": "favorites",
    "title": "Best videos",
  }, {
    "contentId": "WXu7kuaW"
    "type": "playlist"
  }]
}

```

---

**content[].contentId**

The eight-character Playlists IDs from the JW Player dashboard. These IDs populate the video "shelves" in your site. **contentId** is not required if you use `continue_watching` or `favorites` **type**.

---

**content[].type**

It is possible to use 'playlist', 'continue_watching' or 'favorites' as a type. With this, you can change the position of the shelves and turn on/off extra `continue_watching` and `favorites` shelves.

If you want to include `favorites` / `continue_watching` shelf, you should also add a corresponding playlist with `watchlist` type to features section (`features.favoritesList` and `features.continueWatchingList`). To exclude the shelves, remove a corresponding array item and a playlist in `features`.

```
{
  "type": "continue_watching",
}
```

---

**content[].title** (optional)

You can change the playlist title and choose a custom one. It is also possible to do for `continue_watching` and `favorites` types.

---

**content[].featured** (optional)

Controls if the playlist should be used as a large "Featured" shelf on your JW OTT Webapp home page.

---

**content[].backgroundColor** (optional)

You can change the background color of the shelf with the help of this property (e.g. #ff0000).

---

**styling**

Use the `styling` object to define extra styles for your application.

```
{
  "styling": {
    "backgroundColor": null,
    "highlightColor": null,
    "headerBackground": null,
    "footerText": "Blender Foundation"
}
```

---

**styling.backgroundColor** (optional)

Override the theme's background color without needing to change CSS (e.g. #ff0000).

---

**styling.highlightColor** (optional)

Controls the color used for certain UI elements such as progress spinner, buttons, etc. The default is light red.

Specify the color in hexadecimal format. For example, if you want bright yellow, set it to #ffff00

---

**styling.headerBackground** (optional)

Use this parameter to change the background color of the header. By default, the header is transparent. Recommended is to use a HEX color (e.g. `#1a1a1a`) so that the contrast color of the buttons and links can be calculated.

---

**styling.footerText** (optional)

Text that will be placed in the footer of the site. Markdown links are supported.

---

**features**

Use the `features` object to define extra properties for your app.

```
{
  "features": {
    "recommendationsPlaylist": "IHBjjkSN",
    "searchPlaylist": "D4soEviP"
}
```

---

**features.recommendationsPlaylist** (optional)

The eight-character Playlist ID of the Recommendations playlist that you want to use to populate the "Related Videos" shelf in your site. Note that Recommendations requires a JW Player Enterprise license. For more information about Recommendations playlists, see [this JW Player Support article](https://support.jwplayer.com/customer/portal/articles/2191721-jw-recommendations).

---

**features.searchPlaylist** (optional)

The eight-character Playlist ID of the Search playlist that you want to use to enable search on your site. Note that Search requires a JW Player Enterprise license. For more information about Search playlists, see [this JW Player Support article](https://support.jwplayer.com/customer/portal/articles/2383600-building-managing-data-driven-feeds).

---

**features.favoritesList** (optional)

The eight-character Playlist ID of the Watchlist playlist that you want to use to populate the "Favorites" shelf in your site.

---

**features.continueWatchingList** (optional)

The eight-character Playlist ID of the Watchlist playlist that you want to use to populate the "Continue Watching" shelf in your site.

---

**integrations.jwp**

Use the `integrations.jwp` object to activate the JWP integrations for authentication and/or payments and subscriptions.

```
{
  "integrations": {
    "jwp": {
      "clientId": "c6f4002f-7415-4eb6-ab03-72b0f7aaa0e8",
      "assetId": 115022,
      "useSandbox": true
    }
  }
}
```

---

**integrations.jwp.clientId** (optional)

The ID of your JWP Authentication and Subscription environment if you would like to activate JWP account, subscription, and payment functionality. Omit this key in your config to disable this functionality. See [docs/backend-services](backend-services.md) for more details.

---

**integrations.jwp.assetId** (optional)

If JWP authentication is enabled, and you want to show the Payments and Subscription functionality as well, you need to include the asset ID. The application uses this ID to map to a subscription offer that you've configured in your JWP environment that represent your subscription options.

---

**integrations.jwp.useSandbox** (optional)

This setting determines which JWP environment is used. If false or not defined, the production environment is used. If true, the test (sandbox) environment is used. Note, this setting is ignored if JWP integrations are not enabled (i.e. there is not clientId defined)

---

**integrations.cleeng**

Use the `integrations.cleeng` object to integrate with Cleeng.

```
{
  "integrations": {
    "cleeng": {
      "id": "440058292",
      "useSandbox": true,
      "monthlyOffer": "S970187168_NL",
      "yearlyOffer": "S467691538_NL"
    }
}
```

---

**integrations.cleeng.id** (optional)

The ID of your Cleeng ID environment if you would like to integrate with Cleeng as a backend for account, subscription, and checkout functionality. Omit this key in your config to disable Cleeng and the related functionality. See [docs/backend-services](backend-services.md) for more details.

---

**integrations.cleeng.useSandbox** (optional)

This setting determines which Cleeng mediastore URL is used. If false or not defined, the Cleeng production URL is used (https://mediastore.cleeng.com). If true, the Cleeng sandbox URL is used (https://mediastore-sandbox.cleeng.com). Note, this setting is ignored if Cleeng is not enabled (i.e. there is not Cleeng ID defined)

---

**integrations.cleeng.monthlyOffer** (optional)

If Cleeng is enabled, and you want to show the Payments and Subscription functionality, you need to include at least 1 offer ID (either this or the yearly offer property.) The application uses this ID to map to an offer that you've configured in your Cleeng environment under Offers to represent your monthly subscription. Note that the only the data used from the Cleeng offer is the price, the free days, and the free period and the app does not verify if the offer length is actually monthly. If no monthly or yearly offer is configured, the Payments section will not be shown.

---

**integrations.cleeng.yearlyOffer** (optional)

If Cleeng is enabled, and you want to show the Payments and Subscription functionality, you need to include at least 1
offer ID (either this or the monthly offer property.) The application uses this ID to map to an offer that you've
configured in your Cleeng environment under Offers to represent your yearly subscription. Note that the only the data
used from the Cleeng offer is the price, the free days, and the free period and the app does not verify if the offer
length is actually yearly. If no monthly or yearly offer is configured, the Payments section will not be shown.

---

**contentSigningService.host** (optional)

This setting can be set to configure a content signing service
when [URL Signing](https://support.jwplayer.com/articles/how-to-enable-url-token-signing) is enabled for your JW
Dashboard property.

Before playing a media, a POST request is made to the following URL: `${host}/media/${mediaid}/sign`. The response
should return the following payload for the implementation code to use the token:

```json
{
  "entitled": true,
  "token": "JWT_TOKEN"
}
```

The token can be generated using the example in the
official [URL Signing Documentation](https://developer.jwplayer.com/jwplayer/docs/protect-your-content-with-signed-urls.

---

**contentSigningService.drmPolicyId** (optional)

When DRM is enabled for your JW Dashboard Property, all playlist and media requests MUST use the DRM specific endpoints.
When this property is configured, OTT Web App automatically does this for you but all DRM requests must be
signed as well.

For this to work the entitlement service must implement the following endpoints:

**Default public endpoints:**

The public endpoints receive the same payload as the URL signing endpoint, but also receives the `drmPolicyId` in the
path.

[POST] `${host}/media/${mediaid}/sign_public/drm/${drmPolicyId}`
[POST] `${host}/playlist/${mediaid}/sign_public/drm/${drmPolicyId}`

**Watchlist endpoint**

[POST] `${host}/media/${mediaid}/sign_all_public/drm/${drmPolicyId}`

In order to sign multiple media items at once for the favorites and watch history shelves, a different endpoint is used.
The request body contains all media IDs which needs to be signed, for example:

```json
{
  "mediaid1": {},
  "mediaid2": {}
}
```

> **note:** the empty object `{}` is used when using URL params which also need to be included in the JWT token.

The response should be a dictionary with mediaId and token pairs:

```json
{
  "mediaid1": "JWT_TOKEN",
  "mediaid2": "JWT_TOKEN"
}
```
