# Video detail

A video detail page is where a viewer evaluates a published video, before deciding to play the video.

![Video detail](./../_images/video-detail.jpg)

This page displays attributes that are common to all videos, such as:

- Title
- Year
- Length
- Genre
- Rating
- Description
- Image

## Image

- The poster image is available in different resolutions.

- Some platforms require alternate poster images. That needs to be solved with custom properties and a CMS that handles the images.

## Trailers

Customers can add movie trailers to a video through the a custom field `trailerId`. The trailer is just another media item to play. See example below.

### Retrieving video detail data

Video metadata can be retrieved from [GET Media](https://developer.jwplayer.com/jwplayer/reference/get_v2-media-media-id)

```
GET media/dwEE1oBP
{
 "title":"Video Title",
 "description":"Lorem ipsum dolor sit amet",
 "pubdate: 1226866558,
 “duration:596,
 "rating":"CC-BY",
 "genre":"Comedy",
 "trailerId":”sQUr0MIH”,
 "images":[
  {"src":"./media/dwEE1oBP/poster.jpg?width=720" },
  {"src":"./media/dwEE1oBP/poster.jpg?width=1280" }],
 "sources":[]
}
```
