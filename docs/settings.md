# Settings

The JW OTT Web App loads a small settings file at startup.  This file provides a mechanism to configure key parameters without modifying the source code.
A template settings file is included with the production release builds. For all manual builds, the settings file is copied from `settings.<mode>.json` to `public/settings.json`.

## Settings Parameters

### defaultConfigSource

The 8 character ID of the config from your JWP account (or the url path) that the web app will use to load its content. Be careful to ensure that this config is always available or your app will fail to load.

### allowedConfigSources

An array of of 8-character IDs for configs in your JWP account (or url paths) that can be set using the `app-config=<config source>` query param. This may be useful for example if you have a staging or experimental config that you want to be able to test using the `app-config` parameter without changing the default config that the application loads with for all of your users.

### unsafeAllowAnyConfigSource

Boolean flag which if true, enables any 8-character config ID (or path) to be specified with the `app-config=<config source>` query param. 

*Warning: Generally the `unsafeAllowAnyConfigSource` option should only be used for dev, test, or demo deployments, because it opens up your application up so that anyone can specify their own config to run on your domain.* 
