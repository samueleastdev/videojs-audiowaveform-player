# videojs-audiowaveform-player

Simple json audio waveforms

![Simple json audio waveforms](https://samueleast.com/wp-content/uploads/2021/08/Screenshot-2021-08-26-at-23.22.27.png)

## The Waveform Data Is Generated Using the S3Bubble Desktop App

[Download S3Bubble Desktop App](https://s3bubble.com/aws-encoding-desktop-app)

## Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->
## Installation

```sh
npm install --save videojs-audiowaveform-player
```

## Usage

To include videojs-audiowaveform-player on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-audiowaveform-player.min.js"></script>
<script>
  var player = videojs('my-video');

  player.audiowaveformPlayer();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-audiowaveform-player via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-audiowaveform-player');

var player = videojs('my-video');

player.audiowaveformPlayer();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-audiowaveform-player'], function(videojs) {
  var player = videojs('my-video');

  player.audiowaveformPlayer();
});
```

## License

MIT. Copyright (c) Samuel East


[videojs]: http://videojs.com/
