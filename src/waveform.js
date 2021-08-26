export class S3bubbleWaveform {
    
    constructor(options) {

        this.init(options);
    
    }

    init(options){
        
        this.redraw = this.redraw;
            
        this.container = options.container;
        
        this.canvas = options.canvas;
        
        this.data = options.data || [];
        
        this.outerColor = options.outerColor || "transparent";
        
        this.innerColor = options.innerColor || "#000000";
        
        this.normalize = options.normalize || false;
        
        this.pixelRatio = window.devicePixelRatio || screen.deviceXDPI / screen.logicalXDPI;
        
        this.barWidth = options.barWidth || 1;
        
        this.barHeight = options.barHeight || 0;

        this.canvas = this.createCanvas(this.container, options.width, options.height);
        
        this.context = this.canvas.getContext("2d");
        
        this.width = parseInt(this.context.canvas.width, 10);
        
        this.height = parseInt(this.context.canvas.height, 10);
        
        if (options.data) {
        
            this.update(options);
        
        }

    }

    setData(data){

        return this.data = data;

    }


    max(values){
        var max = -Infinity;
            
        for (var i in values) {
        
            if (values[i] > max) {
        
                max = values[i];
        
            }
        
        }

        return max;
    }

    min(values){

        var min = +Infinity;
            
        for (var i in values) {
        
            if (values[i] < min) {
        
                min = values[i];
        
            }
        
        }

        return min;

    }

    update(options){

        this.setData(options.data);

        return this.redraw();

    }

    redraw(){

        this.clear();

        var peaks = this.data;
    
        var hasMinVals = [].some.call(peaks, function (val) {return val < 0;});
        
        var peakIndexScale = 1;
        
        if (hasMinVals) {
        
            peakIndexScale = 2;
        
        }

        var width = this.width;

        var height = this.height;
        
        var offsetY = height * 0;
        
        var halfH = height / 2;
        
        var length = peaks.length / peakIndexScale;
        
        var bar = this.barWidth;
        
        var gap = Math.max(this.pixelRatio, ~~(bar / 2));
        
        var step = bar + gap;

        var absmax = 1 / this.barHeight;
        
        if (this.normalize) {
        
            var max = this.max(peaks);
        
            var min = this.min(peaks);
        
            absmax = -min > max ? -min : max;
        
        }

        var scale = length / width;

        var start = 0;

        var end = width;

        for (var i = (start); i < (end); i += step) {

            if (typeof this.innerColor === "function") {
                
                this.context.fillStyle = this.innerColor(i / this.width);
            
            }

            var peak = peaks[Math.floor(i * scale * peakIndexScale)] || 0;
            
            var h = Math.round(peak / absmax * halfH);
            
            this.context.fillRect((i + 0.5), (halfH - h + offsetY), bar + 0.5, h * 2);
            //this.context.fillRect((i + 0.5), (halfH - h + offsetY), bar + 0.5, h * 2-(h/2));
        }

    }

    clear(){

        this.context.fillStyle = this.outerColor;
            
        this.context.clearRect(0, 0, this.width, this.height);
        
        return this.context.fillRect(0, 0, this.width, this.height);

    }

    patchCanvasForIE(canvas) {
            
        var oldGetContext;
        
        if (typeof window.G_vmlCanvasManager !== "undefined") {
        
            canvas = window.G_vmlCanvasManager.initElement(canvas);
        
            oldGetContext = canvas.getContext;
        
            return canvas.getContext = function(a) {
        
                var ctx;
        
                ctx = oldGetContext.apply(canvas, arguments);
        
                canvas.getContext = oldGetContext;
        
                return ctx;
        
            };
         
        }

    }

    createCanvas(container, width, height) {
        
        var canvas;
        
        canvas = document.createElement("canvas");
        
        container.appendChild(canvas);
        
        canvas.width = width;
        
        canvas.height = height;
        
        return canvas;
    
    }

}