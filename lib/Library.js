"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Library = void 0;
var OHLCCandles_1 = require("./OHLCCandles");
var Util_1 = require("./Util");
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
function cache(candles, key, offset, init, succeed) {
    var value = 0;
    var meta = null;
    var cache = candles.cache[key];
    var cacheTime = cache === null || cache === void 0 ? void 0 : cache.time;
    var time = candles.getOffset(offset).time;
    if (cacheTime === time) {
        value = candles.cache[key].value;
    }
    else if (cacheTime === time - candles.intervalTime) {
        var result = succeed(cache.value, cache.meta);
        value = result.value;
        meta = result.meta;
    }
    else {
        var result = init();
        value = result.value;
        meta = result.meta;
    }
    candles.cache[key] = {
        time: time,
        value: value,
        meta: meta
    };
    return value;
}
exports.Library = {
    trueRange: function (current, previous) {
        return Math.max(current.high - current.low, Math.abs(current.high - previous.close), Math.abs(current.low - previous.close));
    },
    ma: function (candles, length, source, offset) {
        if (source === void 0) { source = 'close'; }
        if (offset === void 0) { offset = 0; }
        return cache(candles, "ma-" + length + "-" + source + "-" + offset, offset, function () {
            var total = 0;
            var values = [];
            for (var i = offset; i < length + offset; i++) {
                var value = candles.getOffset(i)[source];
                total += value;
                values.push(value);
            }
            return {
                value: total / length,
                meta: {
                    total: total,
                    values: values
                }
            };
        }, function (value, meta) {
            var current = candles.getOffset(offset)[source];
            var total = meta.total - meta.values[0] + current;
            meta.values.shift();
            meta.values.push(current);
            return {
                value: total / length,
                meta: {
                    total: total,
                    values: meta.values
                }
            };
        });
    },
    ema: function (candles, length, source, offset) {
        if (source === void 0) { source = 'close'; }
        if (offset === void 0) { offset = 0; }
        var k = 2 / (length + 1);
        return cache(candles, "ema-" + length + "-" + source + "-" + offset, offset, function () {
            var ema = exports.Library.ma(candles, length, source, candles.length - length);
            for (var i = length; i < candles.length - offset; i++) {
                ema = (candles.get(i)[source] * k) + (ema * (1 - k));
            }
            return {
                value: ema,
                meta: null
            };
        }, function (value) { return ({
            value: (candles.getOffset(offset)[source] * k) + (value * (1 - k)),
            meta: null
        }); });
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
    rsi: function (candles, length, offset) {
        if (offset === void 0) { offset = 0; }
        return cache(candles, "rsi-" + length + "-" + offset, offset, function () {
            var totalGain = 0;
            var totalLoss = 0;
            var prevClose = candles.get(candles.length - offset - length).close;
            for (var i = candles.length - offset - length + 1; i < candles.length - offset; i++) {
                var close = candles.get(i).close;
                var change = Util_1.Util.change(prevClose, close) * 100;
                if (change > 0) {
                    totalGain += change;
                }
                else {
                    totalLoss += change * -1;
                }
                prevClose = close;
            }
            var averageGain = totalGain / length;
            var averageLoss = totalLoss / length;
            var rs = averageGain / averageLoss;
            return {
                value: 100 - (100 / (1 + rs)),
                meta: {
                    averageGain: averageGain,
                    averageLoss: averageLoss,
                    close: prevClose
                }
            };
        }, function (value, meta) {
            var close = candles.getOffset(offset).close;
            var change = Util_1.Util.change(meta.close, close) * 100;
            var currentGain = 0, currentLoss = 0;
            if (change > 0) {
                currentGain = change;
            }
            else {
                currentLoss = change * -1;
            }
            var averageGain = (meta.averageGain * 13 + currentGain) / 14;
            var averageLoss = (meta.averageLoss * 13 + currentLoss) / 14;
            var rs = averageGain / averageLoss;
            return {
                value: 100 - (100 / (1 + rs)),
                meta: {
                    averageGain: averageGain,
                    averageLoss: averageLoss,
                    close: close
                }
            };
        });
    },
    macd: function (candles, smoothing, offset) {
        if (smoothing === void 0) { smoothing = 9; }
        if (offset === void 0) { offset = 0; }
        var macd = function (i) { return exports.Library.ema(candles, 12, 'close', i + offset) - exports.Library.ema(candles, 26, 'close', i + offset); };
        return cache(candles, "macd-" + smoothing + "-" + offset, offset, function () {
            var maNums = [];
            for (var i = smoothing * 2 - 1; i >= smoothing; i--) {
                maNums.push(macd(i));
            }
            var maValue = ma(maNums);
            var emaNums = [];
            for (var i = smoothing - 1; i >= 0; i--) {
                emaNums.push(macd(i));
            }
            return {
                value: ema(emaNums, maValue),
                meta: null
            };
        }, function (value) {
            var k = 2 / (smoothing + 1);
            return {
                value: (macd(0) * k) + (value * (1 - k)),
                meta: null
            };
        });
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
    },
    heikinAshi: function (candles, length, offset) {
        if (offset === void 0) { offset = 0; }
        var result = [];
        for (var i = candles.length - length - offset; i < candles.length - offset; i++) {
            if (i === 0)
                continue;
            var candle = candles.get(i);
            var prevCandle = candles.get(i - 1);
            var close = (candle.open + candle.high + candle.low + candle.low) / 4;
            var open = (prevCandle.open + prevCandle.close) / 2;
            var high = Math.max(candle.high, candle.open, candle.close);
            var low = Math.min(candle.low, candle.open, candle.close);
            result.push({
                time: candle.time,
                open: open,
                high: high,
                low: low,
                close: close
            });
        }
        return new OHLCCandles_1.OHLCCandles(result, candles.interval);
    }
};
