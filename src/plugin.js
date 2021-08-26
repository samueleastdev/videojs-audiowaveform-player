import videojs from 'video.js';
import {version as VERSION} from '../package.json';
import { S3bubbleWaveform } from './waveform';

const Plugin = videojs.getPlugin('plugin');

// Default options for the plugin.
const defaults = {
    progressHeight: 70,
    barWidth: 1,
    barHeight: 1,
    brand: 'rgba(75, 150, 242, 1)',
    posterWidth: 160
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

        self.player.bigPlayButton.dispose();

        self.player.controlBar.fullscreenToggle.dispose();

        self.player.getChild('controlBar').el().style.left = self.options.posterWidth + 'px';

        self.player.ready(() => {

            self.player.addClass('vjs-audiowaveform-player');

            if(self.options.hasOwnProperty('waveform')){

                self.buildWaveformUi();
    
                videojs.xhr({
                    method: 'GET',
                    uri: self.options.waveform,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }, function(err, resp, body) {
            
                    if (resp.statusCode === 200) {
            
                        let data = JSON.parse(resp.body);
            
                        self.buildWaveform(data);
            
                    }
            
                });
    
            }


        });
        
        // Set the player src object
        this.player.src(this.options);

    }

    buildWaveformUi(){

        const self = this;

        var WaveformComponent = videojs.getComponent('Component');

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

        var WaveformDiv = videojs.extend(WaveformComponent, {
            constructor: function() {

                WaveformComponent.apply(this, arguments);

                this.addClass('vjs-waveform');

            }
        });

        videojs.registerComponent('waveform', WaveformDiv);

        self.player.addChild('waveform', {});

        this.player.getChild('waveform').el().style.left = self.options.posterWidth + 'px';

        
    }

    buildWaveform(data){

        const self = this;

        // Start colors
        var ctx = document.createElement('canvas').getContext('2d');

        var progress_wave_color = ctx.createLinearGradient(0, 0, 0, self.options.progressHeight);

        progress_wave_color.addColorStop(0.5, 'rgba(51, 51, 51, 1)');

        progress_wave_color.addColorStop(0.5, 'rgba(51, 51, 51, 0.3)');

        var progress_bar_color = ctx.createLinearGradient(0, 0, 0, self.options.progressHeight);

        progress_bar_color.addColorStop(0.5, self.options.brand);

        var progress_bar_hex = self.options.brand;

        progress_bar_color.addColorStop(0.5, progress_bar_hex);
        // End colors

        let waveform_data = data.data;

        let duration = Math.floor(data.metadata.duration);

        let width = (parseInt(getComputedStyle(self.player.el()).width)-self.options.posterWidth);

        const waveform = new S3bubbleWaveform({
            container: self.player.getChild('waveform').el(),
            height: self.options.progressHeight,
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
