# Related Videos

![Related Videos](../_images/related-videos.jpg)

Related videos are a shelf in the [video detail screen](video-detail.md) showing content with similar metadata.

Related videos are powered through [recommendation playlist](https://support.jwplayer.com/topics/recommendations) is used. 

## Retrieve related videos

A [recommendations playlist](https://support.jwplayer.com/topics/recommendations) is used for the related videos shelf. The playlist id is retrieved from the [app config](/docs/configuration.md): `recommendationsPlaylist`

Queries are done using the [playlist endpoint](https://developer.jwplayer.com/jwplayer/reference/get_v2-playlists-playlist-id):

```
GET playlists/fuD6TWcf?related_media_id=dwEE1oBP
{
  "title":"Related Films",
  "description":"",
  "kind":"FEED",
  "feedid":"fuD6TWcf",
  "playlist":[
    {
      "title":"Elephants Dream",
      "mediaid":"8pN9r7vd",
      "image":"https://content.jwplatform.com/v2/media/8pN9r7vd/poster.jpg?width=720",
      "feedid":"fuD6TWcf",
      "duration":653,
      "pubdate":1163708156,
      "description":"Elephants Dream is a 2006 Dutch... ",
      "tags":"movie,Drama",
      "recommendations":"https://content.jwplatform.com/v2/playlists/fuD6TWcf?related_media_id=8pN9r7vd",
      "rating":"CC-BY",
      "genre":"Drama",
      "trailerId":"EorcUZCU"
    },
    {}
   ]
}
```

## Configuration

The feature can be enabled in the [app config](/docs/configuration.md) by setting `recommendationsPlaylist`  to the ID of the recommendations playlist you want to use.
