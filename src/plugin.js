import videojs from 'video.js';
import { version as VERSION } from '../package.json';
import { S3bubbleWaveform } from './waveform';

const Plugin = videojs.getPlugin('plugin');

// Set up audio context
const WaveformComponent = videojs.getComponent('Component');
let currentBuffer = null;

// Default options for the plugin.
const defaults = {
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
};

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class AudiowaveformPlayer extends Plugin {

  /**
 * Create a AudiowaveformPlayer plugin instance.
 *
 * @param  {Player} player
 *         A Video.js Player instance.
 *
 * @param  {Object} [options]
 *         An optional options object.
 *
 *         While not a core part of the Video.js plugin architecture, a
 *         second argument of options is a convenient way to accept inputs
 *         from your plugin's caller.
 */
  constructor(player, options) {
    // the parent class will add player under this.player
    super(player);

    const self = this;

    self.options = videojs.mergeOptions(defaults, options);

    this.player.ready(() => {
      if (self.options.theme === 'audio') {
        this.player.addClass('vjs-audiowaveform-audio-theme');
      }

    });

    self.buildWaveformComponent();

    this.player.on('loadstart', function(_event) {

      let source = self.player.currentSource();

      //self.player.getChild('controlBar').el().style.left = self.options.posterWidth + 'px';

      let url = (source.waveform) ? source.waveform : source.src;

      self.getWaveformData((source.waveform) ? source.waveform : source.src, (source.waveform) ? 'json' : 'arraybuffer').then((body) => {

        if (body instanceof ArrayBuffer) {
          self.convertWaveformData(body).then((res) => {
            self.buildWaveform(res);
          });
        } else {
          self.buildWaveform(body);
        }

      });

    });

  }

  convertWaveformData(body) {

    return new Promise((resolve, reject) => {

      let audioBuffer = audioContext.decodeAudioData(body).then((audioBuffer) => {

        const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
        const samples = 800; // Number of samples we want to have in our final data set
        const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
          let blockStart = blockSize * i; // the location of the first sample in the block
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
          }
          filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
        }

        resolve({
          metadata: {
            duration: audioBuffer.duration,
            channels: audioBuffer.numberOfChannels,
            sample_rate: audioBuffer.sampleRate
          },
          data: filteredData
        });

      }).catch((err) => {
        return reject(`error ${err}`);
      });

    });

  }

  getWaveformData(url, responseType) {

    return new Promise((resolve, reject) => {

      videojs.xhr({
        method: 'GET',
        uri: url,
        responseType: responseType,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }, function(err, resp, body) {

        if (resp.statusCode === 200) {

          resolve(resp.body);

        }

      });

    }).catch((err) => {
      return reject(`error ${err}`);
    });
  }

  buildWaveformComponent() {

    const self = this;

    var WaveformDiv = videojs.extend(WaveformComponent, {
      constructor: function() {

        WaveformComponent.apply(this, arguments);

        this.addClass('vjs-waveform');

      }
    });

    videojs.registerComponent('waveform', WaveformDiv);

    self.player.addChild('waveform', {});

    Object.assign(this.player.getChild('waveform').el().style, self.options.styles);

  }

  buildPosterComponent() {

    const self = this;

    // Extend default
    var WaveformArtwork = videojs.extend(WaveformComponent, {
      constructor: function() {

        WaveformComponent.apply(this, arguments);

        this.addClass('vjs-waveform-artwork');

      },
      createEl: function() {
        return videojs.createEl('div', {
          className: '',
          innerHTML: '<img width="150" src="' + self.options.poster + '"/>'
        });
      },
    });

    videojs.registerComponent('waveformArtwork', WaveformArtwork);

    self.player.addChild('waveformArtwork', {});

  }

  buildWaveform(data) {

    const self = this;

    // Start colors
    var ctx = document.createElement('canvas').getContext('2d');

    var progress_wave_color = ctx.createLinearGradient(0, 0, 0, parseInt(self.options.styles.height));

    progress_wave_color.addColorStop(0.5, 'rgba(51, 51, 51, 1)');

    progress_wave_color.addColorStop(0.5, 'rgba(51, 51, 51, 1)');

    var progress_bar_color = ctx.createLinearGradient(0, 0, 0, parseInt(self.options.styles.height));

    progress_bar_color.addColorStop(0.5, self.options.brand);

    var progress_bar_hex = self.options.brand;

    progress_bar_color.addColorStop(0.5, progress_bar_hex);
    // End colors

    let waveform_data = data.data;

    let duration = Math.floor(data.metadata.duration);

    let width = (parseInt(getComputedStyle(self.player.el()).width));
    //self.options.posterWidth
    const waveform = new S3bubbleWaveform({
      container: self.player.getChild('waveform').el(),
      height: parseInt(self.options.styles.height),
      width: width,
      barWidth: self.options.barWidth,
      barHeight: self.options.barHeight,
      normalize: true,
      innerColor: function(percentage) {

        var songPercentage = self.player.currentTime() / duration;
        return (percentage > songPercentage) ? progress_wave_color : progress_bar_color;

      }
    });

    waveform.update({
      data: waveform_data
    });

    var startEvent = 'click';
    if (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/Android/i)) {
      startEvent = 'touchstart';
    }

    self.player.getChild('waveform').el().addEventListener(startEvent, function(event) {

      var posX, width;

      if (event.touches) {

        var touch = event.touches[0];

        posX = Math.floor(touch.clientX - this.getBoundingClientRect().x);

        width = Math.round(event.target.clientWidth);

      } else {

        posX = Math.round(event.offsetX);

        width = Math.round(event.target.clientWidth);

      }

      self.player.currentTime((self.player.duration() / width) * (posX));

      self.player.play();

    }, false);

    // Redraw the waveform for the color
    self.player.on('timeupdate', function() {

      if (this.currentTime() && waveform) {

        waveform.redraw();

      }

    });

  }

}

// Define default values for the plugin's `state` object here.
AudiowaveformPlayer.defaultState = {};

// Include the version number.
AudiowaveformPlayer.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('audiowaveformPlayer', AudiowaveformPlayer);

export default AudiowaveformPlayer;
