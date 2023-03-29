# Video Shelves and Libraries

<img title="" src="./../_images/shelves.jpg" alt="Shelves" width="316">  <img src="./../_images/library.jpg" title="" alt="Libraries" width="317">

## Shelves

The homepage contains shelves. The standard usage is:

- shelves highlight the most relevant videos for a user
- shelves are visualized in rows of typically 20-40 items
- shelves have horizontal navigation
- shelves are sorted on popular or new content 'new action movies'

There are some special shelves:

- featured shelf: highlight special videos, manually curated and visualized in the top of the homepage
- favorite shelf: a list of videos a user likes to watch in the future. See [Watchlist](user-watchlists.md)
- continue watching shelf:  a list of videos a user has not completed yet. See [Watchlist](user-watchlists.md)

## Libraries

A library allows viewers to browse all videos. The standard usage is: 

- Different libraries per format e.g  ‘movies’, ‘shorts’, ‘shows’
- About 50-500 items per library
- 5-20 genre filters e.g ‘action’, ‘drama’, ‘comedy’

## Video publishing using playlists

Videos are published to shelves and libraries using playlists:

- Playlist are managed through JW Dashboard
- For manual paylist the items and their sorting are determined manually
- For dynamic playlist items are added based on tags and sorted on most viewed, most recently published or alphabetically
- Playlists apply geoblocking: only the video available in the viewer's country are returned. It uses the IP address to determine the country.

<img src="./../_images/playlist-shelf-lib.jpg" title="" alt="Shelves" width="600">

## Images

Each media item has poster images:

- The static thumbnail is automatically taken from a frame of the video
- The motion thumbnail (mp4/no audio) that is automatically derived from the first 5 seconds of the video   
- It’s possible to choose a custom thumbnail. The static thumbnail can be selected from the stills of the media item.
- It’s not possible to have no thumbnails.
- The static thumbnails are automatically resized to 320px-1920px widths, keeping the image ratio stable.

The motion image is not used in the web app. 

The JW Player dashboard, nor the web app support alternate video images at this moment. E.g. an hero image for the video detail page.

## Shelf and library configuration

Shelves and libraries can be defined in the [app config](/docs/configuration.md), rather than hardcoded. This allows customer to change the content from the JW Dashboard. The `filterTags` are used to define the filterbox in the library screen. 

```
{
  "content": [
    {
      "featured": true,
      "playlistId": "JSKF03bk"
    },
    {
      "playlistId": "dGSUzs9o"
    }
  ],
  "menu": [
    {
      "label": "Films",
      "playlistId": "dGSUzs9o",
      "filterTags": "Action,Comedy,Fantasy,Drama"
    },
    {
      "label": "Courses",
      "playlistId": "xQaFzykq",
      "filterTags": "Beginner,Advanced"
    }
  ]
}
```

## Retrieving shelf and library contents

Shelf and library contents are retrieved as a playlist. They can be retrieved with the Playlist API 

```
GET Playlist\<playlistid>
[{
 "title":"Video Title",
 "description":"Lorem ipsum dolor sit amet",  “ 
 "images":[
  {"src":"./media/dwEE1oBP/poster.jpg?width=640" }, 
  {"src":"./media/dwEE1oBP/poster.jpg?width=1280" }
  {"src":"./media/dwEE1oBP/poster.mp4?width=1280" }]
},
{}
]
```

For large libraries, (>500) it is possible to paginate. 

It is possible to query based on tags and custom parameters
