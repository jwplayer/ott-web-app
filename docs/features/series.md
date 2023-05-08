# Series

Series enables customers to bundle episodic content such as TV shows and learning courses or non-episodic content like sports leagues events. By organizing content into a series, viewers are guided through the content. Series have a predefined sequence of episodes and can be split in seasons.

<img title="" src="../_images/series.jpg" alt="Series" width="580">

Series are tagged with `Series` in [shelves and libraries](shelves-and-libraries.md):

<img title="" src="../_images/series-in-library.jpg" alt="Series in library" width="581">

Series are defined through two approaches: 'Series playlist' (deprecated) and 'Series media item' (new native approach).

## (DEPRECATED) Series through playlist

Customers can create a 'Series playlist' and set the sequences and episodes using custom parameters.

### Creating series playlists in the dashboard

The [JW manual](https://support.jwplayer.com/articles/build-an-ott-apps-series-playlist) describes the following process to create a series playlist.

### Series in libraries and shelves

[Shelves and libraries](shelves-and-libraries.md) load their data using the [GET playlist endpoint](https://developer.jwplayer.com/jwplayer/reference/get_v2-playlists-playlist-id). Some items in this playlist refer to series. These are identified using the `seriesPlayListId` OR `seriesPlaylistId` OR `seriesId` custom param, which links to the playlist that contains the episodes.

```
GET playlist/o45EkQBf
{
"title":"All Courses",
"description":"",
"kind":"DYNAMIC",
"feedid":"o45EkQBf",
"playlist":[
 {
   "mediaid":"txHnOU0x",
   "seriesId":"xdAqW8ya",
   "episodes":"4"
   "title":"Primitive Animals",
   "image":"https://content.jwplatform.com/v2/media/txHnOU0x/poster.jpg?width=720",
   "duration":0,
   "pubdate":1615379806,
   "description":"Aimed at beginners, this workshop helps you connect basic Blender functionality into a complete workflow and mindset for building characters.",
   "tags":"course,Beginner"
 },
 { }
]
}
```

### Series detail window

The series detail window loads the series playlist using the [GET playlist endpoint](https://developer.jwplayer.com/jwplayer/reference/get_v2-playlists-playlist-id). The episode label (e.g. `S1:E1`) is coming from `seasonNumber` and `episodeNumber` custom params.

```
GET playlist/xdAqW8ya
{
"title":"Primitive Animals",
"description":"Aimed at beginners, this workshop helps you connect basic Blender functionality into a complete workflow and mindset for building characters.",
"kind":"DYNAMIC",
"feedid":"xdAqW8ya",
"playlist": [
 {
   "title":"Blocking",
   "mediaid":"zKT3MFut",
   "image":"https://content.jwplatform.com/v2/media/zKT3MFut/poster.jpg?width=720",
   "feedid":"xdAqW8ya",
   "duration":345,
   "pubdate":1615370400,
   "description":"If you're brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.",
   "tags":"seriesId_xdAqW8ya,lesson",
   "seasonNumber":"1",
   "episodeNumber":"1",
   "genre":"Beginner",
   "rating":"CC-BY"
 },
 {
   "title":"Modeling",
   "mediaid":"QLPqP2u8",
   "image":"https://content.jwplatform.com/v2/media/QLPqP2u8/poster.jpg?width=720",
   "feedid":"xdAqW8ya",
   "duration":184,
   "pubdate":1615374000,
   "description":"If you're brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.",
   "tags":"seriesId_xdAqW8ya,lesson",
   "seasonNumber":"1",
   "episodeNumber":"2",
   "genre":"Beginner",
   "rating":"CC-BY"
 }
}
```

## (NEW) Native series

JW Player has native series management from the JW Dashboard:

- simplifies the series creation workflow
- automatically calculate the number of episodes and duration of series
- contains trailers and bonus content
- uses dynamic load of episodes and seasons

This section describes how this will work.

### Creating native series in the dashboard

[//]: # 'TODO: Add link'

See the series documentation for the JW dashboard.

### Native series in shelves and libraries

[Shelves and libraries](shelves-and-libraries.md) load their data using the [GET playlist endpoint](https://developer.jwplayer.com/jwplayer/reference/get_v2-playlists-playlist-id). Some items in this playlist refer to series. These can be recognized with the `contentType` custom param set to `series`.

```
GET playlist\<playlistid>
[
 {
     "medaid":"dwEE1oBP",
     "title":"Video Title",
     "description":"Lorem ipsum",
     "contentType": "series",
     "images":[],
     "sources":[],
     "tracks":[]
 }
]
```

> Note: it is also possible to use another `contentType` param after modifying screen mapping (TODO: add screen mapping docs).

### Native series page

The series page loads the series playlist using a GET Series endpoint which provides only basic information about series:

```
  GET /apps/series/{series_id}
  [{
    "series_id": "12345678",
    "total_duration": 12,
    "episode_count": 2,
    "seasons": [
     {
       "season_id": "abcdefgh",
       "season_number": 1,
     },
     {
       "season_id": "ertyuiop",
       "season_number": 2,
     }
  ]}]
```

`seriesId` and `mediaid` (id used in the playlist) are the same, so it is also possible to easily retrieve series metadata (title, description, images and so on) using GET `/v2/media` endpoint.

To get episodes information the following endpoint should be used:

```
  GET /apps/series/${series_id}/episodes?page_offset=1&page_limit=20
 {
   "page":1,
   "page_limit":20,
   "total":13,
   "episodes":[
      {
         "episode_number":1,
         "season_number":2,
         "media_item":{
            "description":"If you're brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.",
            "duration":328,
            "image":"http://cdn.jwplayer.com/v2/media/mhgRidqO/poster.jpg?width=720",
            "images":[
               {
                  "src":"http://cdn.jwplayer.com/v2/media/mhgRidqO/poster.jpg?width=320",
                  "type":"image/jpeg",
                  "width":320
               }
            ],
            "link":"http://cdn.jwplayer.com/previews/mhgRidqO",
            "mediaid":"mhgRidqO",
            "pubdate":1615377600,
            "tags":"lesson,seriesId_sGt93CK6",
            "title":"Shading",
            "original_mediaid":"4GtFaR0V",
            "episodeNumber":"3",
            "genre":"Beginner",
            "rating":"CC-BY",
            "seasonNumber":"1"
         }
      }
   ]
}
```

The endpoint supports pagination which can help to dynamically load the data when scrolling the list of episodes (infinite scroll support).

To get season's information the following endpoint should be used:

```
  GET /apps/series/${series_id}/seasons/{season_number}?page_offset=1&page_limit=20
 {
   "page":1,
   "page_limit":20,
   "total":13,
   "episodes":[
      {
         "episode_number":1,
         "season_number":2,
         "media_item":{
            "description":"If you're brand new to Blender or are getting stuck, check out the Blender 2.8 Fundamentals series.",
            "duration":328,
            "image":"http://cdn.jwplayer.com/v2/media/mhgRidqO/poster.jpg?width=720",
            "images":[
               {
                  "src":"http://cdn.jwplayer.com/v2/media/mhgRidqO/poster.jpg?width=320",
                  "type":"image/jpeg",
                  "width":320
               }
            ],
            "link":"http://cdn.jwplayer.com/previews/mhgRidqO",
            "mediaid":"mhgRidqO",
            "pubdate":1615377600,
            "tags":"lesson,seriesId_sGt93CK6",
            "title":"Shading",
            "original_mediaid":"4GtFaR0V",
            "episodeNumber":"3",
            "genre":"Beginner",
            "rating":"CC-BY",
            "seasonNumber":"1"
         }
      }
   ]
}
```

The endpoint supports pagination which can help to dynamically load seasons's episodes when scrolling the list of episodes (infinite scroll support).

It is also possible to get series information based on the episode. In order to do this a series endpoint should be used with `media_ids` quey param.

```
GET /apps/series/${seriesId}?media_ids=oXW1ahCi
{
   "oXW1ahCi":[
      {
         "series_id":"DYyHUK02",
         "episode_number":10,
         "season_number":1
      },
      {
         "series_id":"mErAKldu",
         "episode_number":10,
         "season_number":1
      }
   ]
}
```

This endpoint returns objects with series which include requested episodes. Each object also has information about episode and season number of episodes in series.

## Native series and search

Customer are advised to exclude series episodes from the search playlists by using tags. Likewise customers should ensure the series title and description are part of the first episode.
