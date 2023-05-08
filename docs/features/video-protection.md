# Video Protection

Videos can be protected in JW platform in two ways:

- **Signed URLs:** A player can only **access** video URLs from JW Player backend using a time-bound JWT token.
- **DRM:** A player can only **play** videos using a time-bound decryption key.

The JW Web Player, as well as the other SDKs, supports these mechanismns out-of-the-box. However this requires a server side authorization service which is **NOT** part of the web app and needs to be **custom developed**.

This article outlines how such an authorization service should work.

## Signed URLs

With [URL signing](https://support.jwplayer.com/articles/how-to-enable-url-token-signing) enabled on the JW property, a video client can only access the media URLs from JW backends when it has a valid JWT token:

```
GET media/PEEzDfdA?token=<tokenA>
{
 "title":"Video Title",
 "description":"Lorem ipsum dolor sit amet",
 "sources":[https://content.jwplatform.com/manifests/PEEzDfdA.m3u8?token=<tokenB>]
}
```

Missing or invalid tokens will result in a `403` forbidden.

Notice that the API response will also have all video URLs signed, making subsequent calls accessing the video sources easy.

### Token generation

This is what a decoded token looks like:

```
{
  "resource": "/v2/media/Xw0oaD4q",
  "exp": 1893456000
}
```

Notice that every token grants access to a unique resource. It's not possible to have token that grants access to a collection of resources.

The tokens are generated using the property API key. See [the documenation](https://developer.jwplayer.com/jwplayer/docs/protect-your-content-with-signed-urls) on how to generate a token.

## DRM

JW [supports](https://developer.jwplayer.com/jwplayer/docs/enable-drm-with-jw-stream) three DRM systems

- Widevine (Google ecosystem)
- PlayReady (Microsoft ecosystem)
- Fairplay (Apple ecosystem)

These systems require a time-bound decryption key, which can be fetched from the license URL.

Also all DRM URLs require to be signed with a token.

```
GET media/PEEzDfdA/drm/:drm_policy_id?token=<tokenA>
{
 "title":"Video Title",
 "description":"Lorem ipsum dolor sit amet",
 "sources":[{
   "drm":{
      "file":":https://content.jwplatform.com/manifests/PEEzDfdA.m3u8?token=<tokenB>",
      "widevine":{"url":"<widevine_license_url>?token=<tokenC>"}
}]
}
```

The full details of this endpoint can be found [here](https://developer.jwplayer.com/jwplayer/reference/get_v2-media-media-id-drm-policy-id).

## Custom Authorization Service

The authorization service should generate the `SignedMediaURLs` based on:

- the general video access model (see below)
- the specific media item being accessed (free or not)
- the users authentication (who is the user)
- the users entitlements (what did he buy)

The service interface could look like this:

`GET /authorization/<siteid>/video-signature/<mediaid>`

### Video access models

The authorization service provides signed URLs based on the access model. Common access models are:

- Advertising-based (AVOD): all videos can be accessed, as they are served with advertisements
- Authentication-based (AUTHVOD): videos can be accessed if the user is logged in
- Subscription-based (SVOD): videos can be accessed if the user has a valid subscription

Note that there are many variations of these access models.

### Free content

It's possible to have free content. This is indicated with media parameter `free` (`requiresSubscription` param is deprecated, accepted values are 'false', 'no' and '0'). As a possible value for `free` param you can use 'true', 'yes' (lower- or uppercase) or '1' number.

### Users and entitlements

The users and their entitlements are typically stored in a subscription management service like JWP or Cleeng.

Users and their entitlements might also be split:

- Users at identity providers like Okta or Amazon Cognito
- Entitlements at a subscription provider like JWP or Cleeng

### SVOD Optimization

Notice that each time a user accesses a video, the service would have to check against the subscription provider (e.g., JWP or Cleeng) to validate if there is a subscription. This request can be slow and might have consumption limits.

To ensure a fast user experience this subscription status can be stored in `UserSubscriptionToken`: a signed time-bound claim that the user has valid subscription. This claim would be exchanged when signing URLs.
