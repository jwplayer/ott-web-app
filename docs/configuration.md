# Configuration

JW OTT Webapp uses a JSON configuration file to store all configuration parameters. This file can be located at the following location: `./public/config.json`.

## Dynamic Configuration

In the `public/index.html` file, a small script is added to allow switching configurations based on a URL search parameter.

You can append `?c=showcase-id` to the URL and use a different configuration. However, this may not be desirable for production builds since there will only be a single configuration.

To disable the dynamic configuration mechanism, remove the following part from the `public/index.html` file.

```html
<script>
  var urlSearchParams = new URLSearchParams(window.location.search);
  var configId =
        urlSearchParams.get('c') ||
        window.localStorage.getItem('jwshowcase.config');

  if (configId) {
    window.localStorage.setItem('jwshowcase.config', configId);

    window.configLocation =
      'https://' + configId + '.jwpapp.com/config.json';
    window.configId = configId;
  } else {
    window.configLocation = './config.json';
  }
</script>
```

## Dynamic Configuration

By default, the `config.json` is served along with the static JW OTT Webapp build. It is possible to use an API to serve the configuration instead. This allows you to update the `menu` or `content` configuration options on-the-fly.

The easiest way to do this, is to override the `window.configLocation` like so:

```html
<script>
  window.configLocation = 'https://api.jw-ott-webapp.com/config';
</script>
```

## Available Configuration Parameters

These are the available configuration parameters for the JW OTT Webapp's config.json file.

**player**

Player key of your custom created player in the [JW Player dashboard](https://dashboard.jwplayer.com).

---

**siteName**

Title of your website. JW OTT Webapp will automatically update the `<title>` tag of your site to this value when the site loads.

---

**description**

Short description of your website. JW OTT Webapp will automatically update the `<meta name='description'>` tag in your site to this value, which can help to improve your site's search engine performance.

---

**footerText** (optional)

Text that will be placed in the footer of the site. Markdown links are supported.

---

**analyticsToken** (optional)

Analytics token for the JW Player's OTT Analytics feature.

---

**assets.banner** (optional)

Location of a JPG, PNG or GIF image to be used as the logo in the header (e.g. **/images/logo.png**).

---

**recommendationsPlaylist** (optional)

The eight-character Playlist ID of the Recommendations playlist that you want to use to populate the "Related Videos" shelf in your site. Note that Recommendations requires a JW Player Enterprise license. For more information about Recommendations playlists, see [this JW Player Support article](https://support.jwplayer.com/customer/portal/articles/2191721-jw-recommendations).

---

**searchPlaylist** (optional)

The eight-character Playlist ID of the Search playlist that you want to use to enable search on your site. Note that Search requires a JW Player Enterprise license. For more information about Search playlists, see [this JW Player Support article](https://support.jwplayer.com/customer/portal/articles/2383600-building-managing-data-driven-feeds).

---

**menu**

Use the `menu` array to define the links that are visible in the header and menu on mobile devices.

```
{
  "menu": [{
    "label": "Movies",
    "playlistId": "lrYLc95e",
    "filterTags": "Action,Comedy,Drama"
  }, {
    "label": "Series",
    "playlistId": "lrYLc95e"
  }]
}
```

---

**menu[].label**

The label is what the user sees in the header and sidebar.

---

**menu[].playlistId**

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
    "playlistId": "lrYLc95e",
    "featured": true
  }, {
    "playlistId": "continue-watching",
    "enableText": false
  }, {
    "playlistId": "WXu7kuaW"
  }]  
}

```    

---

**content[].playlistId**

The eight-character Playlists IDs from the JW Player dashboard. These IDs populate the video "shelves" in your site.

It is also possible to use 'continue-watching' or 'saved-videos' as playlistId. With this, you can change the position and look of these shelves. Example:

```
{
  "playlistId": "continue-watching",
  "enableText": false
}
```

---

**content[].enableText** (optional)

Controls whether or not title and description text overlays appear on the poster images. It is "true" by default. If your poster images contain a lot of text, we recommend setting this to "false."

---

**content[].featured** (optional)

Controls if the playlist should be used as a large "Featured" shelf on your JW OTT Webapp home page.

---

**options.backgroundColor** (optional)

Override the theme's background color without needing to change CSS (e.g. #ff0000).

---

**options.enableContinueWatching** (optional)

Controls whether or not users see the "Continue Watching" shelf in the app and top-level menu. To display Continue Watching, set to "true." To hide it, set to "false."

---

**options.highlightColor** (optional)

Controls the color used for certain UI elements such as progress spinner, buttons, etc. The default is light red.

Specify the color in hexadecimal format. For example, if you want bright yellow, set it to **"highlightColor": "#ffff00"**.

---

**options.enableSharing** (optional)

Set this parameter to `false` if you want to disable the "Share" button on the video and series detail screen.

---

**options.headerBackground** (optional)

Use this parameter to change the background color of the header. By default, the header is transparent. Recommended is to use a HEX color (e.g. `#1a1a1a`) so that the contrast color of the buttons and links can be calculated. 

---

**options.dynamicBlur** (optional)

Set this parameter to `true` if you want to enable the Dynamic Blur feature. The Dynamic Blur feature is a blurred image of the current item on the background of the screen. When a user hovers a card, the blurred image changes to the selected item.  

---

**options.posterFading** (optional)

Set this parameter to `true` if you want to enable the Poster Fading feature. By default, a boxed preview is shown on the video and series detail page. With posterFading set to `true`, this image is placed on the background instead and fills a larger portion of the screen.


---

**options.shelfTitles** (optional)

Set this parameter to `false` if you want to disable titles below the cards on the home, playlist and search screen.  

---

**cleengId** (optional)

The ID of your Cleeng ID environment if you would like to integrate with Cleeng as a backend for account, subscription, and checkout functionality. Omit this key in your config to disable Cleeng and the related functionality. See [docs/backend-services](backend-services.md) for more details.

---

**cleengSandbox** (optional)

This setting determines which Cleeng mediastore URL is used. If false or not defined, the Cleeng production URL is used (https://mediastore.cleeng.com). If true, the Cleeng sandbox URL is used (https://mediastore-sandbox.cleeng.com). Note, this setting is ignored if Cleeng is not enabled (i.e. there is not Cleeng ID defined)

---

**json.cleengMonthlyOffer** (optional)

If Cleeng is enabled, and you want to show the Payments and Subscription functionality, you need to include at least 1 offer ID (either this or the yearly offer property.)  The application uses this ID to map to an offer that you've configured in your Cleeng environment under Offers to represent your monthly subscription. Note that the only the data used from the Cleeng offer is the price, the free days, and the free period and the app does not verify if the offer length is actually monthly.  If no monthly or yearly offer is configured, the Payments section will not be shown.

**json.cleengYearlyOffer** (optional)

If Cleeng is enabled, and you want to show the Payments and Subscription functionality, you need to include at least 1
offer ID (either this or the monthly offer property.)  The application uses this ID to map to an offer that you've
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
When this property is configured, OTT Web App automatically does this automatically for you but all DRM requests must be
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
