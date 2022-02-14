# User watchlists

<img title="" src="./img/watchlist.jpg" alt="continue-watchting" width="542">

###### 

## Favorites watchlist

This watchlist contains movies a user would like to watch in the future. It has the following behavior:

- In the video detail screen, the user can 'favorite' a movie
- On the homepage, a 'favorite' shelf appears, allowing the user
- The user menu shows a link to the list of favorites, including a 'clear' button

## Continue watchlist

This watchlist contains movies a user has not entirely watched. It has the following behavior:

Across the app

- A progress bar shows how much of the content a viewer has watched.
- When a partially watched video is completed, it is removed from the shelf and the progress bar disappears
- Just started (<5%) and almost completed (>95%) plays are ignored for the best experience.

On the homepage

- A “Continue Watching" shelf is added to the home page when there are incomplete items
- The most recent views appear first
- When empty, the shelf is hidden from the home page

The player

- The player automatically resumes from the previous drop off poin

## Storage

For non-logged in users, the watch history is stored clientside in a cookie

For logged in users, the favorites and watch history are stored server side at the subscription or authentication provider to enable **cross-device watch history**

To ensure a **cross-device experience**, we standardize on the following dataformat: 

### Watch history format

```
"history":[ //todo formalize
         {
            "mediaid":"JfDmsRlE",
            "title":"Agent 327",
            "tags":"movie,Action",
            "duration":231.458,
            "progress":0.1168952164107527
         }
      ]
```

### Favorites history format

```
"favorites":[ //todo formalize
         {
            "mediaid":"JfDmsRlE",
            "title":"Agent 327",
            "tags":"movie,Action",
            "duration":231
         }
     ]
```

## Watchlist playlist

The media metadata for the stored media ids an be retrieved through a [watchlist playlist](https://developer.jwplayer.com/jwplayer/reference/get_apps-watchlists-playlist-id):

```
curl 'https://cdn.jwplayer.com/apps/watchlists/<watchlist-id>?media_ids=<media-ids-comma-seperated>'
```

Note that a watchlist need to be created first:

```
curl 'https://api.jwplayer.com/v2/sites/<property-id>/playlists/watchlist_playlist' \
 -H 'authorization: <property-api-key>' \
 -H 'content-type: application/json' \
 --data-raw '{"metadata": {}}' 
```

## Configuration

The continue watchting feature can be enabled and disabled in the app config.  See [configuration](/docs/configuration.md) 

## Cleeng

https://cleeng.com is a subscription management system, which pre-integrated in the web-app. 

For Cleeng we store the watch history in the `customer externalData` attribute. See [here](https://developers.cleeng.com/reference/fetch-customers-data)

### Example Request

```
curl 'https://mediastore-sandbox.cleeng.com/customers/123456789' \
  -X 'PATCH' \
  -H 'authorization: Bearer <token>' \
  --data-raw '{"id":"123456789","externalData":{"history":[{"mediaid":"JfDmsRlE","title":"Agent 327","tags":"movie,Action","duration":231.458,"progress":0.1168952164107527},{"mediaid":"3qMpbJM6","title":"Blender Channel","tags":"live","duration":0,"progress":null}],"favorites":[{"mediaid":"JfDmsRlE","title":"Agent 327","tags":"movie,Action","duration":231}]}}'
```

Example data format

```
 {
   "id":"123456789",
   "externalData":{
      "history":[
         {
            "mediaid":"JfDmsRlE",
            "title":"Agent 327",
            "tags":"movie,Action",
            "duration":231.458,
            "progress":0.1168952164107527
         }
       ],
      "favorites":[
         {
            "mediaid":"JfDmsRlE",
            "title":"Agent 327",
            "tags":"movie,Action",
            "duration":231
         }
      ]
}
```

### Max 25 items

The externalData attribute of Cleeng can contain max 5000 characters. This is 50-75 objects. 

So we maximize the number of history and favorite objects to 25 and rotate the oldest one out based on the 'updated' attribute

The following storage optimized format is under discussion to ensure more items can be stored:

## Optimized format (draft)

```
"history":[ //todo formalize
         {
            "mediaid":"JfDmsRlE",
            "progress":0.1168952164107527,
            "updated":1643900003
         },
         {
            "mediaid":"3qMpbJM6",
            "progress":0.81687652164107234,
            "updated":1643900203
         }
      ]
```
