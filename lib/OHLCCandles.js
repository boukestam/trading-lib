import { Util } from "./Util";
var OHLCCandles = /** @class */ (function () {
    function OHLCCandles(candles, interval, cache) {
        if (cache === void 0) { cache = {}; }
        this.candles = candles;
        this.interval = interval;
        this.intervalTime = Util.intervalToMs(interval);
        this.length = candles.length;
        this.cache = cache;
    }
    OHLCCandles.prototype.forEach = function (callback) {
        for (var _i = 0, _a = this.candles; _i < _a.length; _i++) {
            var candle = _a[_i];
            callback(candle);
        }
    };
    OHLCCandles.prototype.get = function (index) {
        return this.candles[index];
    };
    OHLCCandles.prototype.getOffset = function (offset) {
        return this.candles[this.candles.length - 1 - offset];
    };
    OHLCCandles.prototype.getIndexOfTime = function (time) {
        return this.candles.findIndex(function (candle) { return candle.time >= time; });
    };
    OHLCCandles.prototype.minMax = function () {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for (var _i = 0, _a = this.candles; _i < _a.length; _i++) {
            var candle = _a[_i];
            if (candle.low < min)
                min = candle.low;
            if (candle.high > max)
                max = candle.high;
        }
        return [min, max];
    };
    OHLCCandles.prototype.range = function (start, end) {
        return new OHLCCandles(this.candles.slice(Math.max(start, 0), Math.max(start, end)), this.interval, this.cache);
    };
    OHLCCandles.prototype.transform = function (interval) {
        if (interval === this.interval)
            return this;
        var intervalTime = Util.intervalToMs(interval);
        var output = [];
        var foundFirst = false;
        this.forEach(function (stick) {
            var date = new Date(stick.time * 1000);
            if (!foundFirst) {
                if (date.getUTCHours() == 0 && date.getUTCMinutes() == 0) {
                    foundFirst = true;
                }
                else {
                    return;
                }
            }
            if (output.length == 0 || date.getTime() - output[output.length - 1].time * 1000 >= intervalTime) {
                output.push({
                    time: stick.time,
                    open: stick.open,
                    close: stick.close,
                    low: Number.MAX_VALUE,
                    high: Number.MIN_VALUE
                });
            }
            var current = output[output.length - 1];
            current.low = Math.min(current.low, stick.low);
            current.high = Math.max(current.high, stick.high);
            current.close = stick.close;
        });
        return new OHLCCandles(output, interval);
    };
    return OHLCCandles;
}());
export { OHLCCandles };
;
//# sourceMappingURL=OHLCCandles.js.map