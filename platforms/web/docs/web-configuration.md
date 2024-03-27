# Web configuration

## Configuration File Source

The [ini file](initialization-file.md) determines which app config file the application uses.

You can specify the default that the application starts with and also which config, if any, it will allow to be set using the [`app-config=<config source>` query param](#switching-between-app-configs).
The location is usually specified by the 8-character ID (i.e. `gnnuzabk`) of the App Config from your JWP account, in which case the file will be loaded from the JW Player App Config delivery endpoint (i.e. `https://cdn.jwplayer.com/apps/configs/gnnuzabk.json`).
You may also specify a relative or absolute URL.

### Switching between app configs

As mentioned above, if you have one or more additional allowed sources (see additionalAllowedConfigSources in [`initialization-file`](initialization-file.md)), you can switch between them by adding `app-config=<config source>` as a query parameter in the web app URL in your browser (i.e. `https://<your domain>/?app-config=gnnuzabk`).

The parameter is automatically evaluated, loaded, and stored in browser session storage and should remain part of the url as the user navigates around the site.

> _Note: Be aware that this mechanism only sets the config for the local machine, browser, and session that you are accessing the site with, and it does not change the default hosted app for other users._

Even sharing a URL should work as long as the query parameter of the desired config is part of the URL. 
However, once the query parameter is removed and the stored value in the session is released, 
the application will revert to loading the default config source.

> _Note: to clear the value from session storage and return to the default, you can navigate to the site with a blank query parameter value (i.e. `?app-config=`)_
