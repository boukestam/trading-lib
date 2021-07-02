"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSR = void 0;
function detectSR(candles, min, max, settings) {
    if (settings.method === 'closes') {
        var levels_1 = [];
        var previous_1 = 'none';
        candles.forEach(function (candle) {
            var maxPrice = Math.max(candle.open, candle.close);
            var minPrice = Math.min(candle.open, candle.close);
            for (var i = 0; i < levels_1.length; i++) {
                var level = levels_1[i];
                if (minPrice < level.price && maxPrice > level.price) {
                    levels_1.splice(i, 1);
                    i--;
                    continue;
                }
                if (candle.high > level.price && maxPrice < level.price)
                    level.touches++;
                if (candle.low < level.price && minPrice > level.price)
                    level.touches++;
            }
            if (candle.open > candle.close && (previous_1 === 'none' || previous_1 === 'red')) {
                previous_1 = 'green';
                levels_1.push({
                    price: candle.open,
                    touches: 0
                });
            }
            else if (candle.open < candle.close && (previous_1 === 'none' || previous_1 === 'green')) {
                previous_1 = 'red';
                levels_1.push({
                    price: candle.open,
                    touches: 0
                });
            }
        });
        return levels_1.sort(function (a, b) { return a.price - b.price; });
    }
    else if (settings.method === 'wicks') {
        var stepSize_1 = (max - min) / settings.steps;
        var minPriceDifference_1 = (settings.minDistance * settings.steps) * stepSize_1;
        var touches_1 = {};
        for (var price = min; price < max; price += stepSize_1) {
            touches_1[price] = 0;
        }
        candles.forEach(function (candle) {
            var maxPrice = Math.max(candle.open, candle.close);
            var minPrice = Math.min(candle.open, candle.close);
            for (var price = min; price < max; price += stepSize_1) {
                if (price < candle.low || price > candle.high)
                    continue;
                if (candle.high > price && maxPrice < price)
                    touches_1[price]++;
                if (candle.low < price && minPrice > price)
                    touches_1[price]++;
                if (minPrice < price && maxPrice > price) {
                    touches_1[price]--;
                }
            }
        });
        var levels_2 = [];
        for (var price = min; price < max; price += stepSize_1) {
            if (touches_1[price] > 1) {
                levels_2.push({
                    price: price,
                    touches: touches_1[price]
                });
            }
        }
        levels_2.sort(function (a, b) {
            if (a.touches < b.touches)
                return 1;
            if (b.touches > a.touches)
                return -1;
            return b.price - a.price;
        });
        var _loop_1 = function (i) {
            if (levels_2.some(function (level, levelIndex) { return levelIndex !== i && Math.abs(levels_2[i].price - level.price) < minPriceDifference_1; })) {
                levels_2.splice(i, 1);
            }
        };
        for (var i = levels_2.length - 1; i >= 0; i--) {
            _loop_1(i);
        }
        return levels_2;
    }
    throw new Error('Unknown SR method');
}
function getSR(candles, min, max, settings) {
    var range = candles.range(candles.length - settings.lookback, candles.length - 2);
    return detectSR(range, min, max, settings);
}
exports.getSR = getSR;
