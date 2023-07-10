# Video Analytics

By understanding how viewers consume content across OTT Apps, customers can create informed monetization and engagement strategies.

Video analytics also allows JW Player to calculate recommendations and trending videos, which are critical in monetizing videos.

## Video Event Endpoint

Updating JW Player on OTT video events happens by calling the following endpoint:

```
https://ihe.jwpltx.com/v1/jwplayer6/ping.gif?e=<eventid>&<event-metrics-as-params->
```

For advertisement events (ad impressions) the following endpoint needs to be called:

```
https://ihe.jwpltx.com/v1/clienta/ping.gif?e=<eventid>&<event-metrics-as-params->
```

## Reporting

The data is available to customers in three ways:

- [Dashboard](https://support.jwplayer.com/articles/jw-player-analytics-reference)
- [Reporting API](https://developer.jwplayer.com/jwplayer/docs/analytics-getting-started)
- Play Sessions Data Export which provides aggregated play session data and more detailed metrics in s3 buckets

## Events

The app sends the following events (param `e`) to JW platform:

| Name           | Value | Endpoint  | Rqd | Description                                                          |
| -------------- | ----- | --------- | --- | -------------------------------------------------------------------- |
| Setup          | e     | jwplayer6 | Yes | Fired after the landing screen embedding this video has been loaded. |
| Impression     | i     | clienta   | Yes | Fired after the first frame of an ad creative has been rendered.     |
| Play           | s     | jwplayer6 | Yes | Fired after the first frame of a video has been rendered.            |
| Quantile       | t     | jwplayer6 | Yes | Fired after the video plays past the threshold of a quantile.        |
| Seeked         | vs    | jwplayer6 | Yes | Fired after the video is seeked                                      |
| Generic Aband. | gab   | jwplayer6 | Yes | Fired to try and track a user before they exit the page              |

## Event JS Script

The event trigger implementation for the ott web app can be found at [jwpltx.js](/public/jwpltx.js)

Note that `navigator.sendBeacon()` is used to call the endpoints. The browser will not do CORS checks on this operation. It furthermore minimizes performance impact as the browser doesn't wait for the response of the server.

It also lets us to use `beforeunload` event in order to send remaining data to analytics server when closing the window during watching in progress.

## Analytics ID

A special data parameter is the Analytics ID (`aid`). It determines to which JW Player account & property the events belong. Each property has its unique analytics ID and is provided by a JW PLayer Solution Engineer or Account manager.

For the OTT Web App the Analytics ID is stored in [`config.json`](/public/config.json) as `analyticsToken`

## Metrics

Each event comes with a set of data sent through the query parameters of the JWPlayer OTT Analytics endpoints:

- Session - Timestamp and unique keys
- App - The app of the viewer
- Device - The device of the viewer
- Media - The media that is being watched
- Quantile - How much the user watched a particular movie

These metrics are described below.

### Session Metrics

| Name                  | Key | Rqd | Values               | Example                | Description                                                                 |
| --------------------- | --- | --- | -------------------- | ---------------------- | --------------------------------------------------------------------------- |
| Analytics ID          | aid | Yes | \[a-zA-Z0-9+\_\]{22} | a17e8PTFFffxLgpVuA4vVw | See Analytics ID                                                            |
| Timestamp (Epoch, ms) | sa  | Yes | Unix Epoch Time      | 1539132609637          | The unix epoch time on client machine when ping sent.                       |
| Ping Event Type       | e   | Yes | e, i, s or t         | s                      | Event code of the ping.                                                     |
| Feed ID               | fed | Yes | \[0-9a-zA-Z\]{8}     | ON53iLoH               | Unique ID for a feed or playlist coming out of the JW platform.             |
| Embed ID              | emi | Yes | \[0-9a-z\]{12}       | v7wabv10ynek           | Unique ID generated on embed for the player instance.                       |
| Play ID               | pli | Yes | \[0-9a-z\]{12}       | rc55ceo9sozn           | Unique ID generated for playlist items successfully loaded into the player  |
| Play Session Sequence | pss | Yes | 1-99999 (Integer)    | 1                      | Counter that ticks up when the playlist item changes within the same embed. |

### App Metrics

| Name          | Key  | Rqd | Values              | Example                                  | Description                                         |
| ------------- | ---- | --- | ------------------- | ---------------------------------------- | --------------------------------------------------- |
| App Version   | av   | Yes | A string            | 1.0.0                                    | Version of the App                                  |
| App Bundle ID | bun  | Yes | Reverse domain name | com.apple.calculator                     | Unique ID to the App; persists through uninstalls.  |
| App User ID   | oaid | Yes | \[0-9a-z\]{40}      | 51f8cf1797aac87ede45c2883797f124fed0258d | Hash of the app user account login ID. <sup>1</sub> |
| App Config ID | oiid | No  | \[0-9a-z\]{8}       | dGSUzs9o                                 | Unique ID of app config.                            |

<sup>1</sup> For Cleeng `oaid` maps to the `subscriberId`

### Device Metrics

| Name             | Key  | Rqd | Values              | Example                              | Description                                             |
| ---------------- | ---- | --- | ------------------- | ------------------------------------ | ------------------------------------------------------- |
| Device OS        | oos  | Yes | See<sup>1</sup>     | RokuOS                               | Name of OS on the OTT device.                           |
| Device Model     | om   | No  | \-                  | 4210R                                | OTT device model number.                                |
| OS Version       | oosv | No  | \-                  | 8.1                                  | Version of the OS on the OTT device.                    |
| OS Language      | olng | No  | \-                  | en-us                                | Language of the OS on the OTT device.                   |
| Firmware Version | ofv  | No  | \-                  | 3443.2435                            | OTT Device Firmware version                             |
| Advertising ID   | ifa  | No  | 32 Hex (8-4-4-4-12) | df07c7dc-cea7-4a89-b328-810ff5acb15d | Unique ID ofthe mobile device; user can opt-out /reset. |

<sup>1</sup> Allowed values are: `Web`, `tvOS`, `Tizen`, `SmartCast`, `RokuOS`, `iPadOS`, `iOS`, `Fire TV`, `Fire Mobile`, `Apple TVOS`, `Android TV`, `Android Mobile`, `Android`

### Player Metrics

| Name                    | Key  | Rqd | Values                                  | Example | Description                                                      |
| ----------------------- | ---- | --- | --------------------------------------- | ------- | ---------------------------------------------------------------- |
| SDK Platform            | sdk  | Yes | See <sup>1</sup>                        | 3       | Used to identify the platform. <sup>2</sup>.                     |
| JW Partner Player ID    | ppid | No  | 0: reserved for JWP, 1-99: for partners | 2       | Provided JW Partner Player ID.                                   |
| Ping Spec Version       | psv  | No  | SemVer                                  | 1.0.0   | Version of the JW Ping Specification referenced.                 |
| External Player Version | epv  | No  | \-                                      | 1.2.3   | Version number of external video player (not a JW player or SDK) |

<sup>1</sup> Allowed values are: `0` = web, `1` = Android, `2`= iOS, `3` = Roku, `4` = tvOS, `5` = Chromecast Receiver, `6` = FireOS. </br>
<sup>2</sup> This field was intended to identify the JW Player SDK. However, OTT reports use it to determine the device platform. We, therefore, keep using this field to indicate the OS platform for pragmatic reasons. As a result, it overlaps with field `oos`

### Media Metrics

| Name                 | Key | Rqd          | Values           | Example                    | Description                                       |
| -------------------- | --- | ------------ | ---------------- | -------------------------- | ------------------------------------------------- |
| Media ID             | id  | Yes          | \[0-9a-zA-Z\]{8} | 9u6OHIO4                   | A unique identifier for a JW Player media item.   |
| Media Title          | t   | Yes          | \-               | The Perfect Holiday Turkey | The provided title for the current playlist item. |
| Video Duration (sec) | vd  | <sup>1</sup> | \-               | 141                        | Duration of the video                             |

<sup>1</sup>Only requied for the play event `s`

### Quantile Metrics

Quantiles are to track how much of a video is watched. It's fired after the video plays past the threshold of a quantile. The number of quantiles in a video depends on video length.

There are 3 related parameters:

- Video Duration `vd`
- Video Quantiles `q`
- Quantile Watched `pw`

The table belows defines the relations and when the Quantile (`t`) event ping should be fired.

Any decimal values are truncated to an integer.

#### Example

- a video is 72 seconds long (`vd=72`)
- hence it will be split into 8 quantiles (`q=8`). Each quantile will be 72/8=9 seconds.
- the first quantile event should fire when the 9th second of the video has been crossed. Quantile watched would have value 16 (`pw=16`).
- the second time this event should fire when the 18th second is crossed. Quantile watched its value would be 32 (`pw=32`)

#### Quantiles Table

|        | vd<30 sec | 30≤vd<60 sec | 60≤vd<180 sec | 180≤vd<300 sec | vd≥300 sec |
| ------ | --------- | ------------ | ------------- | -------------- | ---------- |
|        | q=1       | q=4          | q=8           | q=16           | q=32       |
| pw=4   |           |              |               |                | t=0.03125  |
| pw=8   |           |              |               | t=0.0625       | t=0.0625   |
| pw=12  |           |              |               |                | t=0.09375  |
| pw=16  |           |              | t=0.125       | t=0.125        | t=0.125    |
| pw=20  |           |              |               |                | t=0.15625  |
| pw=24  |           |              |               | t=0.1875       | t=0.1875   |
| pw=28  |           |              |               |                | t=0.21875  |
| pw=32  |           | t=0.25       | t=0.25        | t=0.25         | t=0.25     |
| pw=36  |           |              |               |                | t=0.28125  |
| pw=40  |           |              |               | t=0.3125       | t=0.3125   |
| pw=44  |           |              |               |                | t=0.34375  |
| pw=48  |           |              | t=0.375       | t=0.375        | t=0.375    |
| pw=52  |           |              |               |                | t=0.40625  |
| pw=56  |           |              |               | 0.4375         | t=0.4375   |
| pw=60  |           |              |               |                | t=0.46875  |
| pw=64  |           | t=0.5        | t=0.5         | t=0.5          | t=0.5      |
| pw=68  |           |              |               |                | t=0.53125  |
| pw=72  |           |              |               | t=0.5625       | t=0.5625   |
| pw=76  |           |              |               |                | t=0.59375  |
| pw=80  |           |              | t=0.625       | t=0.625        | t=0.625    |
| pw=84  |           |              |               |                | t=0.65625  |
| pw=88  |           |              |               | t=0.6875       | t=0.6875   |
| pw=92  |           |              |               |                | t=0.71875  |
| pw=96  |           | t=0.75       | t=0.75        | t=0.75         | t=0.75     |
| pw=100 |           |              |               |                | 0.78125    |
| pw=104 |           |              |               | t=0.8125       | t=0.8125   |
| pw=108 |           |              |               |                | t=0.84375  |
| pw=112 |           |              | t=0.875       | t=0.875        | t=0.875    |
| pw=116 |           |              |               |                | t=0.90625  |
| pw=120 |           |              |               | t=0.9375       | t=0.9375   |
| pw=124 |           |              |               |                | t=0.96875  |
| pw=128 | t=1       | t=1          | t=1           | t=1            | t=1        |

### Live Streams

For live streams, this quantile distribution is ignored and time ticks are sent at pre-set intervals of 20 seconds. The following values are sent:

- pw (Quantile watched): -1
- q (Quantiles): 0
- ti (Interval in seconds): 20
