# What are content types?

In order to map data coming from the JWP delivery pipeline to the correct screen components in the app,
we use the concept of 'content types'.
Basically, a content type is simply a custom parameter named 'contentType' on a media item with a value defining which type the media is (movie, trailer, series, etc.)

In the app, content types often map to specific screens (see [screenMapping.ts](src/screenMapping.ts) and [MediaScreenRouter.tsx](src/pages/ScreenRouting/MediaScreenRouter.tsx).)
Each content type screen often expects different metadata attached to the media item's custom parameters.

# Using content types in the JWP dashboard

To help ensure that content editors use the right content types and custom parameters, the JWP dashboard has a content type feature.
You can upload the schema for the content types that your app expects.
Content editors will then be able to choose a content type for each media item and will see the expected metadata when they are editing the item on the dashboard.

> Note: Content types on the JWP dashboard requires a specific entitlement. Please speak with your account rep to enable this feature for your account.

## Uploading content types to the dashboard

In order to quickly upload the content types, you can use the yarn script included with this repository as so:

`yarn load-content-types --site-id=<site id>`

By default, the script will load the content types that the vanilla web app expects found in [content-types.json](scripts/content-types/content-types.json).
You can modify this file in your fork of the web app code or optionally specify another file to load by adding a `--source-file=<file path>` param to the yarn script call. 

### Content type upload file definition

The upload file should be a json property with the schemas defined as an array on the `schemas` property on the root object.
Please refer to [content-types.json](scripts/content-types/content-types.json) and the JWP documentation for the schema format.

To avoid unnecessary duplication the file also allows some basic abstraction.
You can define reused fields and sections as key-value entries on the `fields` and `sections` properties respectively.
Then you can include these reusable entities by putting their string key into schemas the same way that you would for inline fields or sections.
There are many examples in the included [content-types.json](scripts/content-types/content-types.json)

> Note: Although the upload file allows you to define reused fields and sections, when these are uploaded they become distinct copies for each instance in the schemas where they are used.
> That means that changing fields and sections via the api after they are uploaded must be done individually for each schema.
> Alternatively, you can re-upload and overwrite the existing schemas, but use caution because you will lose any other manual changes you have made.  
