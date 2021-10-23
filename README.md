# videojs-audiowaveform-player

Simple json audio waveforms

![Simple json audio waveforms](https://samueleast.com/wp-content/uploads/2021/08/Screenshot-2021-08-26-at-23.22.27.png)

## The Waveform Data Is Generated Using the S3Bubble Desktop App

[Download S3Bubble Desktop App](https://s3bubble.com/aws-encoding-desktop-app)

it will fallback to AudioContext Web API

## You Can Get A Player Via The S3Bubble API

```
curl "https://s3bubbleapi.com/player?code={replace with your player code}" \
-H "Authorization: {replace with your api key}"
```

## Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->

## Installation

```sh
npm install --save @samueleastdev/videojs-audiowaveform-player
```

## Usage

To include @samueleastdev/videojs-audiowaveform-player on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-audiowaveform-player.min.js"></script>
<script>
  var wavePlayer = videojs("videojs-audiowaveform", {
    inactivityTimeout: 0,
    plugins: {
      audiowaveformPlayer: {
        theme: "audio",
        barWidth: 1,
        barHeight: 1,
        brand: "rgba(75, 150, 242, 1)",
        posterWidth: 160,
        styles: {
          position: "absolute",
          height: "120px",
          bottom: "30px",
        },
      },
    },
  });

  wavePlayer.src({
    poster:
      "https://d3370nekj200fx.cloudfront.net/2acd5699_8858_48fd_96c2_b87b5cc16442/master.jpg",
    src: "https://d3370nekj200fx.cloudfront.net/2acd5699_8858_48fd_96c2_b87b5cc16442/master.m3u8",
    type: "application/x-mpegURL",
    waveform:
      "https://d3370nekj200fx.cloudfront.net/2acd5699_8858_48fd_96c2_b87b5cc16442/master.json",
  });
</script>
```

## License

MIT. Copyright (c) Samuel East

[videojs]: http://videojs.com/
