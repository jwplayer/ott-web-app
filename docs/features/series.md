# Series

Series enables customers to bundle episodic content such as TV shows and learning courses or non-episodic content like sports leagues events. By organizing content into a series, viewers are guided through the content. Series have a predefined sequence of episodes and can be split in seasons.

<img title="" src="../_images/series.jpg" alt="Series" width="580">

Series are tagged with `Series` in [shelves and libraries](shelves-and-libraries.md):

<img title="" src="../_images/series-in-library.jpg" alt="Series in library" width="581">

Series are defined through two approaches: 'Series playlist' (deprecated) and 'Series media item' (new native approach).

## (DEPRECATED) Series through playlist

Customers can create a 'Series playlist' and set the sequences and episodes using custom parameters.

### Creating series playlists in the dashboard

The [JW manual](https://support.jwplayer.com/articles/build-an-ott-apps-series-playlist) describes the following process to create a serie playlist.

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

This section describes how this will work.

### Creating native series in the dashboard

1. Customers create media items from the Media Library page with "Series" content type.
2. Customers add episodes to the media item. Media item / series item is the same entity now. They both have the same id.
3. Customers publish their series by putting media items into a playlist

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

We can also show episode number and season number for separate series episodes in case they have `seasonNumber` and `episodeNumber` custom params.

### Native series detail window

The series detail window loads the series playlist using a GET Series endpoint:

```
  GET /apps/series/{series_id}
  {
  "title": "A Series of Unfortunate Events",
  "description": "The series follow’
  "series_id": "12345678",
  "total_duration": 12,
  "episode_count": 2,
  "episodes": [],
  "seasons": [
   {
     "season_id": "abcdefgh",
     "season_number": 1,
     "episodes": [
       {
         "episode_number": 1,
         "media_id": "zxcvbnma"
       },
     ]
   },
   {
     "season_id": "ertyuiop",
     "season_number": 2,
     "episodes": [
       {
         "episode_number": 1,
         "media_id": "lkjhgfds"
       },
     ]
   }
  ]}]
```

Notice that the episodes don't include metadata (title, description, image, etc. ). That needs be retrieved seperately. This can be done one-by-one using [GET Media](https://developer.jwplayer.com/jwplayer/reference/get_v2-media-media-id), but to do this more efficiently episodes endpoint can be used (`/apps/series/${seriesId}/episodes`).

```
GET /apps/series/${seriesId}/episodes
{
  media: {
    '0t21PUiy': {
      description:
        "Let's get started with the Art of Blocking! The purpose of blocking is to play around with ideas and quickly iterate over several versions of a model, in order to find the right direction. During blocking it's essential to keep things simple, both in terms of shapes and materials - and do not be afraid to throw things away!",
      duration: 3408,
      image: 'http://cdn.jwplayer.com/v2/media/0t21PUiy/poster.jpg?width=720',
      images: [
        {
          src: 'http://cdn.jwplayer.com/v2/media/0t21PUiy/poster.jpg?width=320',
          type: 'image/jpeg',
          width: 320,
        },
        {
          src: 'http://cdn.jwplayer.com/v2/media/0t21PUiy/poster.jpg?width=480',
          type: 'image/jpeg',
          width: 480,
        },
        {
          src: 'http://cdn.jwplayer.com/v2/media/0t21PUiy/poster.jpg?width=640',
          type: 'image/jpeg',
          width: 640,
        },
        {
          src: 'http://cdn.jwplayer.com/v2/media/0t21PUiy/poster.jpg?width=720',
          type: 'image/jpeg',
          width: 720,
        },
        {
          src: 'http://cdn.jwplayer.com/v2/media/0t21PUiy/poster.jpg?width=1280',
          type: 'image/jpeg',
          width: 1280,
        },
        {
          src: 'http://cdn.jwplayer.com/v2/media/0t21PUiy/poster.jpg?width=1920',
          type: 'image/jpeg',
          width: 1920,
        },
      ],
      link: 'http://cdn.jwplayer.com/previews/0t21PUiy',
      mediaid: '0t21PUiy',
      pubdate: 1555599600,
      tags: 'lesson',
      title: 'Blocking',
      original_mediaid: 'I3k8wgIs',
      genre: 'Advanced',
      rating: 'CC-BY',
      backgroundImage: 'background',
      contentType: 'Episode',
    },
  },
  siteId: 'siteId',
  page: 1,
  page_length: 50,
  total: 5,
};
```

## Native series and search

Customer are advised to exclude series episodes from the search playlists by using tags. Likewise customers should ensure the series title and description are part of the first episode.

## Coming soon

We will add full Favorites and Continue Watching support

```

```
