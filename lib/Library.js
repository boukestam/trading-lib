"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Library = void 0;
function ma(nums) {
    var total = 0;
    for (var _i = 0, nums_1 = nums; _i < nums_1.length; _i++) {
        var num = nums_1[_i];
        total += num;
    }
    return total / nums.length;
}
function ema(nums, ma) {
    var k = 2 / (nums.length + 1);
    var ema = ma;
    for (var _i = 0, nums_2 = nums; _i < nums_2.length; _i++) {
        var num = nums_2[_i];
        ema = (num * k) + (ema * (1 - k));
    }
    return ema;
}
exports.Library = {
    trueRange: function (current, previous) {
        return Math.max(current.high - current.low, Math.abs(current.high - previous.close), Math.abs(current.low - previous.close));
    },
    ma: function (candles, length, source, offset) {
        if (source === void 0) { source = 'close'; }
        if (offset === void 0) { offset = 0; }
        var total = 0;
        for (var i = candles.length - length - offset; i < candles.length - offset; i++) {
            total += candles.get(i)[source];
        }
        return total / length;
    },
    ema: function (candles, length, source, offset) {
        if (source === void 0) { source = 'close'; }
        if (offset === void 0) { offset = 0; }
        var k = 2 / (length + 1);
        var ema = exports.Library.ma(candles, length, source, length + offset);
        for (var i = candles.length - offset - length; i < candles.length - offset; i++) {
            ema = (candles.get(i)[source] * k) + (ema * (1 - k));
        }
        return ema;
    },
    atr: function (candles, length, offset) {
        if (offset === void 0) { offset = 0; }
        var total = 0;
        var count = 0;
        for (var i = Math.max(0, candles.length - length - offset); i < candles.length - offset; i++) {
            total += exports.Library.trueRange(candles.get(i), candles.get(i - 1));
            count++;
        }
        return total / count;
    },
    lowest: function (candles, length, source, offset) {
        if (source === void 0) { source = 'low'; }
        if (offset === void 0) { offset = 1; }
        var low = candles.get(candles.length - length - offset)[source];
        for (var i = 1; i < length; i++) {
            var candle = candles.get(Math.max(candles.length - length - offset + i, 0));
            if (candle[source] < low)
                low = candle[source];
        }
        return low;
    },
    highest: function (candles, length, source, offset) {
        if (source === void 0) { source = 'high'; }
        if (offset === void 0) { offset = 1; }
        var high = candles.get(Math.max(candles.length - length - offset, 0))[source];
        for (var i = 1; i < length; i++) {
            var candle = candles.get(Math.max(candles.length - length - offset + i, 0));
            if (candle[source] > high)
                high = candle[source];
        }
        return high;
    },
    dmi: function (candles, length, offset) {
        if (offset === void 0) { offset = 0; }
        var plusDM = 0;
        var minusDM = 0;
        var tr = 0;
        for (var i = candles.length - length - length - offset; i < candles.length - length - offset; i++) {
            var candle = candles.get(i);
            var prevCandle = candles.get(i - 1);
            plusDM += Math.max(0, candle.high - prevCandle.high);
            minusDM += Math.max(0, prevCandle.low - candle.low);
            tr += exports.Library.trueRange(candle, prevCandle);
        }
        var plusDI = 0;
        var minusDI = 0;
        var dx = 0;
        for (var i = candles.length - length - offset; i < candles.length - offset; i++) {
            var candle = candles.get(i);
            var prevCandle = candles.get(i - 1);
            plusDM = plusDM - (plusDM / 14) + Math.max(0, candle.high - prevCandle.high);
            minusDM = minusDM - (minusDM / 14) + Math.max(0, prevCandle.low - candle.low);
            tr = tr - (tr / 14) + exports.Library.trueRange(candle, prevCandle);
            plusDI = (plusDM / tr) * 100;
            minusDI = (minusDM / tr) * 100;
            dx += (plusDI - minusDI) / (plusDI + minusDI) * 100;
        }
        return [plusDI, minusDI, dx / length];
    },
    roc: function (candles, length, offset) {
        if (offset === void 0) { offset = 0; }
        var current = candles.get(Math.max(candles.length - 1 - offset, 0)).close;
        var previous = candles.get(Math.max(candles.length - 1 - offset - length, 0)).close;
        return ((current - previous) / previous) * 100;
    },
    macd: function (candles, smoothing, offset) {
        if (smoothing === void 0) { smoothing = 9; }
        if (offset === void 0) { offset = 0; }
        var macd = function (i) { return exports.Library.ema(candles, 12, 'close', i + offset) - exports.Library.ema(candles, 26, 'close', i + offset); };
        var maNums = [];
        for (var i = smoothing * 2 - 1; i >= smoothing; i--) {
            maNums.push(macd(i));
        }
        var maValue = ma(maNums);
        var emaNums = [];
        for (var i = smoothing - 1; i >= 0; i--) {
            emaNums.push(macd(i));
        }
        return ema(emaNums, maValue);
    },
    cci: function (candles, length, offset) {
        if (offset === void 0) { offset = 0; }
        var movingAverage = 0;
        var typicalPrice = 0;
        for (var i = candles.length - length - offset; i < candles.length - offset; i++) {
            var candle = candles.get(i);
            typicalPrice = (candle.high + candle.low + candle.close) / 3;
            movingAverage += typicalPrice / length;
        }
        var meanDeviation = 0;
        for (var i = candles.length - length - offset; i < candles.length - offset; i++) {
            var candle = candles.get(i);
            typicalPrice = (candle.high + candle.low + candle.close) / 3;
            meanDeviation += Math.abs(typicalPrice - movingAverage) / length;
        }
        return (typicalPrice - movingAverage) / (0.015 * meanDeviation);
    }
};
