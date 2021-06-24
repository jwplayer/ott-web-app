# Configuration

JW OTT Webapp uses a JSON configuration file to store all configuration parameters. This file can be located at the following location: `./public/config.json`.

## Dynamic Configuration

In the `public/index.html` file, a small script is added to allow switching configurations based on a URL search parameter.

You can append `?c=showcase-id` to the URL and use a different configuration. However, this may not be desirable for production builds since there will only be a single configuration.

To disable the dynamic configuration mechanism, remove the following part in the `public/index.html` file.

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

Use the `menu' array to define the links that are visible in the header and menu on mobile devices.

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

Use the `content' array to define which and how content playlists should be displayed in "shelves". For optimal performance and user experience, we recommend a maximum of 10 playlists. See the available options below to configure each shelf separately.

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

**options.shelveTitles** (optional)

Set this parameter to `false` if you want to disable titles below the cards on the home, playlist and search screen.  

