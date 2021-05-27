import { Candles } from "./Candles";

export const Library = {
  ma: (candles: Candles, length: number, source: 'low' | 'high' | 'close' | 'open' = 'close', offset: number = 0): number => {
    let total = 0;

    for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
      total += candles.get(i)[source];
    }

    return total / length;
  },
  ema: (candles: Candles, length: number, source: 'low' | 'high' | 'close' | 'open' = 'close', offset: number = 0): number => {
    return 0;
  },
  atr: (candles: Candles, length: number, offset: number = 0): number => {
    let total = 0;

    for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
      const candle = candles.get(i);
      total += Math.max(
        candle.high - candle.low,
        Math.abs(candle.high - candle.close),
        Math.abs(candle.low - candle.close)
      );
    }

    return total / length;
  },
  lowest: (candles: Candles, length: number, offset: number = 0): number => {
    let low = candles.get(candles.length - length - offset).low;

    for (let i = candles.length - length - offset + 1; i < candles.length - offset; i++) {
      const candle = candles.get(i);
      if (candle.low < low) low = candle.low;
    }

    return low;
  },
  highest: (candles: Candles, length: number, offset: number = 0): number => {
    let high = candles.get(candles.length - length - offset).high;

    for (let i = candles.length - length - offset + 1; i < candles.length - offset; i++) {
      const candle = candles.get(i);
      if (candle.high > high) high = candle.high;
    }

    return high;
  },
  adx: (candles: Candles, length: number, offset: number = 0): number => {
    

    for (let i = candles.length - length - offset + 1; i < candles.length - offset; i++) {
      const candle = candles.get(i);
      const prevCandle = candles.get(i - 1);

      const plusDM = candle.high - prevCandle.high;
      const minusDM = prevCandle.low - candle.low;
      
      
    }

    return 0;
  },
  roc: (candles: Candles, length: number, offset: number = 0): number => {
    const current = candles.get(candles.length - 1 - offset).close;
    const previous = candles.get(candles.length - 1 - offset - length).close;

    return ((current - previous) / previous) * 100;
  }
}