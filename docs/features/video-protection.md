# Video Protection

Videos can be protected in JW platform in two ways:

- **Signed URLs:** A player can only **access** video URLs from JW Player backend using a time-bound JWT token
- **DRM:** A player can only **play** videos using a time-bound decryption key. 

The  JW Web Player, as well as the other SDKs, supports these mechanismns out-the-box but they require a server side entitlement service which is **NOT** part of the web app and needs to be **custom developed**.

This article outlines such entitlement service should work. 

## Signed URLs

With [URL signing](https://support.jwplayer.com/articles/how-to-enable-url-token-signing) enabled on the JW property, a video client can only access the media URLs from JW backends when it has a valid JWT token:

```
GET media/PEEzDfdA?token=:tokenA
{
 "title":"Video Title",
 "description":"Lorem ipsum dolor sit amet", 
 "sources":[https://content.jwplatform.com/manifests/PEEzDfdA.m3u8?token=:tokenB]
}
```

Missing or invalid tokens will result in a `403` forbidden.

Notice that the API response will also have all video URLs signed, making subsequent calls easy.

### Token generation

This is how a decoded token looks like:

```
{
  "resource": "/v2/playlists/Xw0oaD4q",
  "exp": 1893456000
}
```

Notice that every token grants access to a unique resource. It's not possible to have token that grant access to a collection of resources.

The tokens are generated using the property API key. See [the documenation](https://developer.jwplayer.com/jwplayer/docs/protect-your-content-with-signed-urls) on how to generate a token.

## DRM

JW [supports](https://developer.jwplayer.com/jwplayer/docs/enable-drm-with-jw-stream) three DRM systems

* Widevine (Google ecosystem)
* PlayReady (Microsoft ecosystem)
* Fairplay (Apple ecosystem)

These  system require a time-bound decryption key, which can be fetched from the license URL. 

Also these URLs require to be signed with a token.

```
GET media/PEEzDfdA/drm/:drm_policy_id?token=:tokenA>
{
 "title":"Video Title",
 "description":"Lorem ipsum dolor sit amet", 
 "sources":[{
   "drm":{
      "file":":https://content.jwplatform.com/manifests/PEEzDfdA.m3u8?token=:tokenB",
      "widevine":{"url":":widevine_license_url?token=:tokenC"}
}]
}
```

The full details of this endpoint can be found [here](https://developer.jwplayer.com/jwplayer/reference/get_v2-media-media-id-drm-policy-id).



## Custom Entitlement Service

The entitlement service should generates the `SignedMediaURLs` based on the given access model (see below) and media item. 

The service interface could look like this: 

`GET /entitlement/:siteid/video-signature/:mediaid`

### Video access models

The entitlement service provide signed URL based on the access model: 

- Advertising-based (AVOD): all videos can be accessed, as they are served with advertisements
- Authentication-based (AUTHVOD): videos can be accessed if the user is loggged in
- Subscription-based (SVOD): videos can be accessed if the user has a valid subscription

This access model could be stored in the in the [app config](/docs/configuration.md).

### Free content

I's possible to have free content. This is indicated with media parameter `requiresSubscription`. 

### SVOD Optimization

Notice that each time a user accesses a video, the service would have to check against the subscription provider (e.g., Cleeng) to validate if there is the subscription. This request can be slow and might have consumption limits. 

To ensure a fast user experience this subscription status can be stored in ``UserSubscriptionToken``: a signed time-bound claim that the user has valid subscription. This claim would be exchanged when signing URLs. 
