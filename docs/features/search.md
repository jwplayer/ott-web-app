# Search

![Search](../_images/search.jpg)

Search is essentially a [library](shelves-and-libraries.md) screen that reacts to a search term. A search queries the media `title` and `description` fields.

## Retrieve search results

Like libraries, search results are coming from playlist: [a search playlist](https://docs.jwplayer.com/platform/docs/vdh-create-a-search-playlist). The playlist id is retrieved from the [app config](/docs/configuration.md): `searchPlaylist`

Search queries are done using the [GET playlist endpoint](https://developer.jwplayer.com/jwplayer/reference/get_v2-playlists-playlist-id):

```
GET playlists/tQ832H1H?search=bunny
{
  "title":"Search Results",
  "description":"",
  "kind":"SEARCH",
  "feedid":"tQ832H1H",
  "playlist":[
    {
      "title":"Big Buck Bunny",
      "mediaid":"dwEE1oBP",
      "image":"https://content.jwplatform.com/v2/media/dwEE1oBP/poster.jpg?width=720",
      "duration":596,
      "pubdate":1226866558,
      "description":"Big Buck Bunnyis a 2008...",
      "tags":"movie,Comedy",
      "rating":"CC-BY",
      "genre":"Comedy",
      "trailerId":"sQUr0MIH",
    }
  ]
}
```

## Configuration

The feature can be enabled in the [app config](/docs/configuration.md) by setting `searchPlaylist` to the ID of the recommendations playlist you want to use.
