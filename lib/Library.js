"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Library = void 0;
exports.Library = {
    ma: (candles, length, source = 'close', offset = 0) => {
        let total = 0;
        for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
            total += candles.get(i)[source];
        }
        return total / length;
    },
    ema: (candles, length, source = 'close', offset = 0) => {
        const k = 2 / (length + 1);
        let ema = candles.get(Math.max(candles.length - offset - length, 0))[source];
        for (let i = candles.length - offset - length + 1; i >= 0 && i < candles.length; i++) {
            ema = (candles.get(i)[source] * k) + (ema * (1 - k));
        }
        return ema;
    },
    atr: (candles, length, offset = 0) => {
        let total = 0;
        for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
            const candle = candles.get(i);
            total += Math.max(candle.high - candle.low, Math.abs(candle.high - candle.close), Math.abs(candle.low - candle.close));
        }
        return total / length;
    },
    lowest: (candles, length, source = 'low', offset = 0) => {
        let low = candles.get(candles.length - length - offset)[source];
        for (let i = candles.length - length - offset + 1; i >= 0 && i < candles.length - offset; i++) {
            const candle = candles.get(i);
            if (candle[source] < low)
                low = candle[source];
        }
        return low;
    },
    highest: (candles, length, source = 'high', offset = 0) => {
        let high = candles.get(Math.max(candles.length - length - offset, 0))[source];
        for (let i = candles.length - length - offset + 1; i >= 0 && i < candles.length - offset; i++) {
            const candle = candles.get(i);
            if (candle[source] > high)
                high = candle[source];
        }
        return high;
    },
    adx: (candles, length, offset = 0) => {
        for (let i = candles.length - length - offset + 1; i < candles.length - offset; i++) {
            const candle = candles.get(i);
            const prevCandle = candles.get(i - 1);
            const plusDM = candle.high - prevCandle.high;
            const minusDM = prevCandle.low - candle.low;
        }
        return 0;
    },
    roc: (candles, length, offset = 0) => {
        const current = candles.get(Math.max(candles.length - 1 - offset, 0)).close;
        const previous = candles.get(Math.max(candles.length - 1 - offset - length, 0)).close;
        return ((current - previous) / previous) * 100;
    },
    macd: (candles, offset = 0) => {
        return exports.Library.ema(candles, 12, 'close', offset) - exports.Library.ema(candles, 26, 'close', offset);
    }
};
