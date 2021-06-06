"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Library = void 0;
exports.Library = {
    trueRange: (current, previous) => {
        return Math.max(current.high - current.low, Math.abs(current.high - previous.close), Math.abs(current.low - previous.close));
    },
    ma: (candles, length, source = 'close', offset = 0) => {
        let total = 0;
        for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
            total += candles.get(i)[source];
        }
        return total / length;
    },
    ema: (candles, length, source = 'close', offset = 0) => {
        const k = 2 / (length + 1);
        let ema = exports.Library.ma(candles, length, source, length + offset);
        for (let i = candles.length - offset - length; i < candles.length - offset; i++) {
            ema = (candles.get(i)[source] * k) + (ema * (1 - k));
        }
        return ema;
    },
    atr: (candles, length, offset = 0) => {
        let total = 0;
        let count = 0;
        for (let i = Math.max(0, candles.length - length - offset); i < candles.length - offset; i++) {
            total += exports.Library.trueRange(candles.get(i), candles.get(i - 1));
            count++;
        }
        return total / count;
    },
    lowest: (candles, length, source = 'low', offset = 0) => {
        let low = candles.get(candles.length - length - offset)[source];
        for (let i = 1; i < length; i++) {
            const candle = candles.get(Math.max(candles.length - length - offset + i, 0));
            if (candle[source] < low)
                low = candle[source];
        }
        return low;
    },
    highest: (candles, length, source = 'high', offset = 0) => {
        let high = candles.get(Math.max(candles.length - length - offset, 0))[source];
        for (let i = 1; i < length; i++) {
            const candle = candles.get(Math.max(candles.length - length - offset + i, 0));
            if (candle[source] > high)
                high = candle[source];
        }
        return high;
    },
    dmi: (candles, length, offset = 0) => {
        let plusDM = 0;
        let minusDM = 0;
        let tr = 0;
        for (let i = candles.length - length - length - offset; i < candles.length - length - offset; i++) {
            const candle = candles.get(i);
            const prevCandle = candles.get(i - 1);
            plusDM += Math.max(0, candle.high - prevCandle.high);
            minusDM += Math.max(0, prevCandle.low - candle.low);
            tr += exports.Library.trueRange(candle, prevCandle);
        }
        let plusDI = 0;
        let minusDI = 0;
        let dx = 0;
        for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
            const candle = candles.get(i);
            const prevCandle = candles.get(i - 1);
            plusDM = plusDM - (plusDM / 14) + Math.max(0, candle.high - prevCandle.high);
            minusDM = minusDM - (minusDM / 14) + Math.max(0, prevCandle.low - candle.low);
            tr = tr - (tr / 14) + exports.Library.trueRange(candle, prevCandle);
            plusDI = (plusDM / tr) * 100;
            minusDI = (minusDM / tr) * 100;
            dx += (plusDI - minusDI) / (plusDI + minusDI) * 100;
        }
        return [plusDI, minusDI, dx / length];
    },
    roc: (candles, length, offset = 0) => {
        const current = candles.get(Math.max(candles.length - 1 - offset, 0)).close;
        const previous = candles.get(Math.max(candles.length - 1 - offset - length, 0)).close;
        return ((current - previous) / previous) * 100;
    },
    macd: (candles, smoothing = 9, offset = 0) => {
        const macd = (i) => exports.Library.ema(candles, 12, 'close', i + offset) - exports.Library.ema(candles, 26, 'close', i + offset);
        const k = 2 / (smoothing + 1);
        let ema = macd(smoothing - 1);
        for (let i = smoothing - 2; i >= 0; i--) {
            ema = (macd(i) * k) + (ema * (1 - k));
        }
        return ema;
    }
};
