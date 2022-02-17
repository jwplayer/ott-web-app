# Search

![Search](img/search.jpg)

Search is essentially a [library](shelves-and-libraries.md) screen that react to search term.  A search queries on the media  `title` and `description` fields

## Retrieve search results

Like libraries, search results are coming from playlist: [a search playlist](https://support.jwplayer.com/articles/create-a-playlist).

Search queries can be done using the [GET playlist endpoint](https://developer.jwplayer.com/jwplayer/reference/get_v2-playlists-playlist-id). 

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

The feature can be enabled and disabled in the [app config](/docs/configuration.md).

## 
