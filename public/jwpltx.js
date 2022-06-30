/***
 Javascript library for sending OTT analytics to JW Player.
 Include in your head and include the following listeners:

 jwplayer().on("ready",function(evt) {
	jwpltx.ready(
		CONFIG.analyticsToken, // Analytics token
		window.location.hostname, // Domain name
		getParam("fed"), // ID of referring feed
		item.mediaid, // ID of media playing
		item.title // Title of media playing
	);
});

 jwplayer().on("time",function(evt) {
	jwpltx.time(evt.currentTime,evt.duration);
});

 jwplayer().on("complete",function(evt) {
	jwpltx.complete();
});

 jwplayer().on("adImpression",function(evt) {
	jwpltx.adImpression();
});
 ***/

window.jwpltx = window.jwpltx || {};

(function (o) {
  // Hostname for sending analytics
  const URL = 'https://ihe.jwpltx.com/v1/jwplayer6/ping.gif?';
  // Query parameters for sending analytics
  const URI = {
    pss: '1',
    oos: 'Web',
    oosv: '5',
    sdk: '0',
  };
  // query params instance.
  let uri;
  // Current time for live streams.
  let current;

  // Process a player ready event
  o.ready = function (aid, bun, fed, id, t) {
    uri = JSON.parse(JSON.stringify(URI));
    uri.aid = aid;
    uri.bun = bun;
    uri.fed = fed;
    uri.id = id;
    uri.t = t;

    uri.emi = generateId(12);
    uri.pli = generateId(12);
    sendData('e');
  };

  // Process an ad impression event
  o.adImpression = function () {
    sendData('i');
  };

  // Process a time tick event
  o.time = function (vp, vd) {
    // 0 or negative vd means live stream
    if (vd < 1) {
      // Initial tick means play() event
      if (!uri.pw) {
        uri.vd = 0;
        uri.q = 0;
        uri.pw = -1;
        uri.ti = 20;
        current = vp;
        sendData('s');

        // monitor ticks for 20s elapsed
      } else {
        if (vp - current > 20) {
          current = vp;
          sendData('t');
        }
      }

      // positive vd means  VOD stream
    } else {
      // Initial tick means play() event
      if (!uri.vd) {
        uri.vd = Math.round(vd);
        if (vd < 30) {
          uri.q = 1;
        } else if (vd < 60) {
          uri.q = 4;
        } else if (vd < 180) {
          uri.q = 8;
        } else if (vd < 300) {
          uri.q = 16;
        } else {
          uri.q = 32;
        }
        uri.ti = Math.round(uri.vd / uri.q);
        uri.pw = 0;
        sendData('s');

        // monitor ticks for entering new quantile
      } else {
        let pw = (Math.floor(vp / uri.ti) * 128) / uri.q;
        if (pw != uri.pw) {
          uri.pw = pw;
          sendData('t');
        }
      }
    }
  };

  // Process a video complete events
  o.complete = function () {
    if (uri.pw != 128) {
      uri.pw = 128;
      sendData('t');
    }
  };

  // Helper function to generate IDs
  function generateId(len) {
    let arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('');
  }

  function dec2hex(dec) {
    return dec.toString(16).padStart(2, '0');
  }

  // Serialize and send data to JW Player
  function sendData(type) {
    uri.e = type;
    uri.sa = Date.now();
    // Serialize data
    let str = '';
    for (let key in uri) {
      if (uri[key] !== null) {
        str == '' ? null : (str += '&');
        str += key + '=' + encodeURIComponent(uri[key]);
      }
    }
    // Ads are sent to special bucket
    let url = URL;
    if (uri.e == 'i') {
      url = URL.replace('jwplayer6', 'clienta');
    }
    // Send data if analytics token is set
    if (uri.aid) {
      navigator.sendBeacon(url + str);
    } else {
      // eslint-disable-next-line no-console
      console.log(url + str);
    }
  }
})(window.jwpltx);
