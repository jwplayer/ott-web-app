# Initialization (ini) File

The JW OTT Web App loads a small initialization (.ini) file at startup. This file provides a mechanism to set key startup parameters without modifying the source code.
Template ini files are included in the repo and with the pre-compiled production release builds ([.webapp.prod.ini](/ini/templates/.webapp.prod.ini)).
Make sure you include a copy of the ini file edited to include your account data at `/public/.webapp.ini` for the application to load correctly.

For all manual builds (`yarn start` or `yarn build`), the ini file is copied from `/ini/.webapp.<mode>.ini` to `build/public/.webapp.ini`, which the application fetches and parses at startup. For production builds, the ini file is stripped of comments and extra whitespace.
If a file doesn't exist in /ini/.webapp.<mode>.ini, then the template file will first be copied from [`/ini/templates`](/ini/templates).
All of the .ini files directly inside of `/ini` are ignored in git, so you can create your own files locally to run the application with your account parameters without creating conflicts with committed code or leaking your details into source control.

## Ini Parameters

### defaultConfigSource

The 8 character ID (or the url path) of the app config from your JWP account that the web app will use to load its content. Be careful to ensure that this config is always available or your app will fail to load.

This value can alternatively be provided at compile time via the [APP_DEFAULT_CONFIG_SOURCE](build-from-source.md#app_default_config_source) environment variable if you are doing your own builds.
Keep in mind, if the `deafultConfigSource` ini setting is provided, it will be used even if the [APP_DEFAULT_CONFIG_SOURCE](build-from-source.md#app_default_config_source) environment variable is set.

> Note: you probably always want to include a default config source for any production deployment. If there are no valid config sources the application will throw an error at startup.

### playerId

This value determines which player the OTT Web App loads from the JW Platform.
By default, the OTT Web App uses a global JWP OTT player that has its setting optimized to work properly with the app, but you can change it if you want to use a player directly from your own account.

This value can alternatively be provided at compile time via the [APP_PLAYER_ID](build-from-source.md#app_player_id) environment variable if you are doing your own builds.
Keep in mind, if the `playerId` ini setting is provided, it will be used even if the [APP_PLAYER_ID](build-from-source.md#app_player_id) environment variable is set.

> Note: Be careful if using your own player, since some settings in the player can conflict with the way the player is used in the OTT Web App, causing unexpected behavior or UX experiences.

> Note: If you opt to use the default global player, remember to provide your player key via the [APP_PLAYER_LICENSE_KEY](build-from-source.md#app_player_license_key) env variable or the [playerLicenseKey setting](initialization-file.md#playerLicenseKey) in the ini file.

### playerLicenseKey

This value is used to set the player key for the player loaded from the JW Platform.
The player relies on this key for certain features, such as analytics to work properly.

The value to use can be found labeled 'License Key' in the 'Self-Hosted Web Player' section in the ['Players' page on the JWP dashboard](https://dashboard.jwplayer.com/p/players).

If you link directly to your JWP cloud player using the [APP_PLAYER_ID](build-from-source.md#app_player_id) environment variable or the [playerId ini setting](initialization-file.md#playerid), you do not need to provide a value for `playerLicenseKey`.

This value can alternatively be provided at compile time via the [APP_PLAYER_LICENSE_KEY](build-from-source.md#APP_PLAYER_LICENSE_KEY) environment variable if you are doing your own builds and want to further obfuscate the key.
Keep in mind, if the playerLicenseKey ini setting is provided, it will be used even if the [APP_PLAYER_LICENSE_KEY](build-from-source.md#app_player_license_key) environment variable is set.

### additionalAllowedConfigSources[]

An array of 8-character IDs (entered 1 per line) for app configs in your JWP account (or url paths) that can be used with the [`app-config=<config source>` query param](configuration.md#switching-between-app-configs).
This may be useful for example if you have a staging or experimental config that you want to be able to test on your site using the [`app-config` query parameter](configuration.md#switching-between-app-configs) without changing the default config that the application loads with for all of your users.
See [.webapp.test.ini](/ini/templates/.webapp.test.ini) for an example.

### UNSAFE_allowAnyConfigSource

Boolean flag which if true, enables **ANY** 8-character app config ID (or path) to be specified with the [`app-config=<config source>` query param](configuration.md#switching-between-app-configs).

> _**Warning:** Generally the `UNSAFE_allowAnyConfigSource` option should only be used for dev, test, or demo deployments, because it will allow anyone to create URL's that specify any config to be displayed on your domain._
