# Initialization (ini) File

The JW OTT Web App loads a small initialization (.ini) file at startup.  This file provides a mechanism to set key startup parameters without modifying the source code.
Template ini files are included in the repo and with the pre-compiled production release builds ([.webapp.prod.ini](/ini/templates/.webapp.prod.ini)).
Make sure you include a copy of the ini file edited to include your account data at `/public/.webapp.ini` for the application to load correctly.

For all manual builds (`yarn start` or `yarn build`), the ini file is copied from `/ini/.webapp.<mode>.ini` to `build/public/.webapp.ini`, which the application fetches and parses at startup.
If a file doesn't exist in /ini/.webapp.<mode>.ini, then the template file will first be copied from [`/ini/templates`](/ini/templates).
All of the .ini files directly inside of `/ini` are ignored in git, so you can create your own files locally to run the application with your account parameters without creating conflicts with committed code or leaking your details into source control.

## Ini Parameters

### defaultConfigSource

The 8 character ID of the app config from your JWP account (or the url path) that the web app will use to load its content. Be careful to ensure that this config is always available or your app will fail to load.

> Note: you probably always want to include a default config source for any production deployment. If there are no valid config sources the application will throw an error at startup. 
### additionalAllowedConfigSources[]

An array of of 8-character IDs (entered 1 per line) for app configs in your JWP account (or url paths) that can be used with the [`app-config=<config source>` query param](configuration.md#switching-between-app-configs).
This may be useful for example if you have a staging or experimental config that you want to be able to test on your site using the [`app-config` query parameter](configuration.md#switching-between-app-configs) without changing the default config that the application loads with for all of your users.
See [.webapp.test.ini](/ini/templates/.webapp.test.ini) for an example.

### UNSAFE_allowAnyConfigSource

Boolean flag which if true, enables **ANY** 8-character app config ID (or path) to be specified with the [`app-config=<config source>` query param](configuration.md#switching-between-app-configs). 

>***Warning:** Generally the `UNSAFE_allowAnyConfigSource` option should only be used for dev, test, or demo deployments, because it will allow anyone to create URL's that specify any config to be displayed on your domain.* 
