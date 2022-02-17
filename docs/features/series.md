# Series

Series enables customers to bundle episodic content such as TV shows and learning courses or non-episodic content like sports leagues events. 

By organizing content into a series, viewers are guided through the content.

Series have a predefined sequence of episodes and can be split in seasons
<img title="" src="img/series.jpg" alt="Series" width="580">
Series are tagged with `Series` in [shelves and libraries](shelves-and-libraries.md):
<img title="" src="img/series-in-library.jpg" alt="Series in library" width="581">
Series are defined through 'series playlist'. This is handled in the first piece of this article.

In the near future JW player will native series construct. This is handled in the second part of this article.

## Series through playlist

### Creating series playlists in the dashboard

Series are not a native construct in the JW Dashboard at this moment. So customers create a 'series playlist' and set the sequences and episodes using custom parameters.
The [JW manual](https://support.jwplayer.com/articles/build-an-ott-apps-series-playlist) describes the following process to do this: 

1. Create a Series playlist that automatically adds media as episodes based on series tag, e.g. `seriesId_xdAqW8ya`

2. Upload the media items and
   
   - tag them with the series id. E.g. `seriesId_xdAqW8ya`
   
   - provide it with the episode number e.g. `episodeNumber: 1`
   
   - provide it with the season number e.g. `seasonNumber: 1`

3. Add a media item that points to the series playlist using a parameter, e.g:  `seriesId: xdAqW8ya`. It's used as the card:

4. Add the card to playlists  used in [shelves and libraries](shelves-and-libraries.md) E.g. library 'All Shows'
   
   ### Series in libraries and shelves
   
   [Shelves and libraries](shelves-and-libraries.md) load their data using the [GET playlist endpoint](https://developer.jwplayer.com/jwplayer/reference/get_v2-playlists-playlist-id). Some items in this  playlis refer to series. These are identified using the `seriesId` , which links to the  playlist that contains the episodes. 
   
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
   
   ### Serie detail window
   
   The serie detail window loads the series playlist using the [GET playlist endpoint](https://developer.jwplayer.com/jwplayer/reference/get_v2-playlists-playlist-id). The episodelabel(e.g. `S1:E1`)  is coming from `seasonNumber` and `episodeNumber` 
   
   ```
   GET playlist/xdAqW8ya
   {
   "title":"Primitive Animals",
   "description":"Aimed at beginners, this workshop helps you connect basic Blender functionality into a complete workflow and mindset for building characters.",
   "kind":"DYNAMIC",
   "feedid":"xdAqW8ya",
   "playlist":[
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
   
   ## Native series - Coming soon
   
   JW Player will get native series management from the JW Dashboard:
- simplifies the series creation workflow

- automatically calculate the number of episodes and duration of series

- contains trailers and bonus content
  This section describes how this will work. 
  
  ### Creating native series in the dashboard
1. Customers define series 

2. Customers publish their series by putting an episode into a playlist

3. The episode can be recognized with the tag `Series` 
   
   ### Native series in shelves and libraries
   
   [Shelves and libraries](shelves-and-libraries.md) load their data using the [GET playlist endpoint](https://developer.jwplayer.com/jwplayer/reference/get_v2-playlists-playlist-id). Some items in this playlis refer to series. These can be recognized with the tag `Series`
   
   ```
   GET playlist\<playlistid>
   [
    {
        "medaid":"dwEE1oBP",
        "title":"Video Title",
        "description":"Lorem ipsum",
        "tags":["Series"],
        "images":[],
        "sources":[],
        "tracks":[]
    }
   ]
   ```
   
   Since the playlist includes an episode metadata, it needs to be  overwritten with a series metadata. This series metadata is retrieve using the the the following endpoint:
   
   ```
   GET series?media_ids=dwEE1oBP,1q2w3e4r
   {
    "dwEE1oBP": {
        "series": [
            {
                "serieid": "ssFF1oBP",
                "title": "My series",
                "description": "Lorem Ipsum",
                "total_duration": 9000,
                "episode_count": 15,
                "season_count": 2,
                "custom_field": "abc"
            }
        ]
    },
    "1q2w3e4r": null
   }
   ```
   
   ### Native series detail window
   
   The serie detail window loads the series playlist using a GET Series endpoint:
   
   ```
   GET series/{series_id}
   { 
   "title": "A Series of Unfortunate Events",
   "description": "The series follow’
   "showrunner": "Mark Hudis"
   "series_id": "12345678",
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
   
   Notice that the episodes don't include metadata (title, description, image, etc. ). That needs be retrieved seperately. This can be done one-by-one using [GET Media](https://developer.jwplayer.com/jwplayer/reference/get_v2-media-media-id), but to do this more efficiently we use the a [watchlist playlist](https://developer.jwplayer.com/jwplayer/reference/get_apps-watchlists-playlist-id):
   
   ```
   GET playlist?mediaids=zxcvbnma,lkjhgfds
   [{
    "title": "Big Buck Bunny",
    "description": "Lorem ipsum",
    "playlist": [
        {
            "title": "Big Buck Bunny",
            "mediaid": "dwEE1oBP",
            "images": [],
            "duration": 596,
            "description": Lorem ipsum,
            "tags": "movie,Comedy"
    ]
   }
   ```
   
   This playlist type is developed for [user watchlists](user-watchlist.md) but will also work here. Make sure the  watchlist is created.

## Native series and search

Customer are advised to exclude series episodes from the search playlists by using tags. Likewise customers should ensure the serie title and description are part of the first episode.
