import { Candles } from "./Candles";
import { OHLC } from "./OHLC";
import { OHLCCandles } from "./OHLCCandles";
import { Util } from "./Util";

function ma (nums: number[]): number {
  let total = 0;

  for (const num of nums) total += num;

  return total / nums.length;
}

function ema (nums: number[], ma: number): number {
  const k = 2 / (nums.length + 1);
  let ema = ma;

  for (const num of nums) {
    ema = (num * k) + (ema * (1 - k));
  }

  return ema;
}

function cache (candles: Candles, key: string, offset: number, init: () => {
  value: number,
  meta: any
}, succeed: (value: number, meta: any) => {
  value: number,
  meta: any
}) {
  let value = 0;
  let meta = null;

  const cache = candles.cache[key];
  const cacheTime = cache?.time;
  const time = candles.getOffset(offset).time;

  if (cacheTime === time) {
    value = candles.cache[key].value;
  } else if (cacheTime === time - candles.intervalTime) {
    const result = succeed(cache.value, cache.meta);
    value = result.value;
    meta = result.meta;
  } else {
    const result = init();
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

export const Library = {
  trueRange: (current: OHLC, previous: OHLC): number => {
    return Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );
  },
  ma: (candles: Candles, length: number, source: 'low' | 'high' | 'close' | 'open' = 'close', offset: number = 0): number => {
    return cache(
      candles, 
      `ma-${length}-${source}-${offset}`, 
      offset,
      () => {
        let total = 0;
        const values = [];

        for (let i = offset; i < length + offset; i++) {
          const value = candles.getOffset(i)[source];

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
      },
      (value, meta: {
        total: number;
        values: number[];
      }) => {
        const current = candles.getOffset(offset)[source];
        const total = meta.total - meta.values[0] + current;

        meta.values.shift();
        meta.values.push(current);

        return {
          value: total / length,
          meta: {
            total: total,
            values: meta.values
          }
        };
      }
    );
  },
  ema: (candles: Candles, length: number, source: 'low' | 'high' | 'close' | 'open' = 'close', offset: number = 0): number => {
    const k = 2 / (length + 1);

    return cache(
      candles,
      `ema-${length}-${source}-${offset}`,
      offset,
      () => {
        let ema = Library.ma(candles, length, source, candles.length - length);

        for (let i = length; i < candles.length - offset; i++) {
          ema = (candles.get(i)[source] * k) + (ema * (1 - k));
        }

        return {
          value: ema,
          meta: null
        };
      },
      (value) => ({
        value: (candles.getOffset(offset)[source] * k) + (value * (1 - k)),
        meta: null
      })
    )
  },
  atr: (candles: Candles, length: number, offset: number = 0): number => {
    let total = 0;
    let count = 0;

    for (let i = Math.max(0, candles.length - length - offset); i < candles.length - offset; i++) {
      total += Library.trueRange(candles.get(i), candles.get(i - 1));
      count++;
    }

    return total / count;
  },
  lowest: (candles: Candles, length: number, source: 'low' | 'high' | 'close' | 'open' = 'low', offset: number = 1): number => {
    let low = candles.get(candles.length - length - offset)[source];

    for (let i = 1; i < length; i++) {
      const candle = candles.get(Math.max(candles.length - length - offset + i, 0));
      if (candle[source] < low) low = candle[source];
    }

    return low;
  },
  highest: (candles: Candles, length: number, source: 'low' | 'high' | 'close' | 'open' = 'high', offset: number = 1): number => {
    let high = candles.get(Math.max(candles.length - length - offset, 0))[source];

    for (let i = 1; i < length; i++) {
      const candle = candles.get(Math.max(candles.length - length - offset + i, 0));
      if (candle[source] > high) high = candle[source];
    }

    return high;
  },
  dmi: (candles: Candles, length: number, offset: number = 0): number[] => {
    let plusDM = 0;
    let minusDM = 0;
    let tr = 0;

    for (let i = candles.length - length - length - offset; i < candles.length - length - offset; i++) {
      const candle = candles.get(i);
      const prevCandle = candles.get(i - 1);

      plusDM += Math.max(0, candle.high - prevCandle.high);
      minusDM += Math.max(0, prevCandle.low - candle.low);
      tr += Library.trueRange(candle, prevCandle);
    }
    
    let plusDI = 0;
    let minusDI = 0;
    let dx = 0;

    for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
      const candle = candles.get(i);
      const prevCandle = candles.get(i - 1);

      plusDM = plusDM - (plusDM / 14) + Math.max(0, candle.high - prevCandle.high);
      minusDM = minusDM - (minusDM / 14) + Math.max(0, prevCandle.low - candle.low);
      tr = tr - (tr / 14) + Library.trueRange(candle, prevCandle);

      plusDI = (plusDM / tr) * 100;
      minusDI = (minusDM / tr) * 100;

      dx += (plusDI - minusDI) / (plusDI + minusDI) * 100;
    }

    return [plusDI, minusDI, dx / length];
  },
  roc: (candles: Candles, length: number, offset: number = 0): number => {
    const current = candles.get(Math.max(candles.length - 1 - offset, 0)).close;
    const previous = candles.get(Math.max(candles.length - 1 - offset - length, 0)).close;

    return ((current - previous) / previous) * 100;
  },
  rsi: (candles: Candles, length: number, offset: number = 0): number => {
    return cache(
      candles, 
      `rsi-${length}-${offset}`, 
      offset,
      () => {
        let totalGain = 0;
        let totalLoss = 0;
        let prevClose = candles.get(candles.length - offset - length).close;

        for (let i = candles.length - offset - length + 1; i < candles.length - offset; i++) {
          const close = candles.get(i).close;
          const change = Util.change(prevClose, close) * 100;

          if (change > 0) {
            totalGain += change;
          } else {
            totalLoss += change * -1;
          }
          
          prevClose = close;
        }

        const averageGain = totalGain / length;
        const averageLoss = totalLoss / length;

        const rs = averageGain / averageLoss;

        return {
          value: 100 - (100 / (1 + rs)),
          meta: {
            averageGain: averageGain,
            averageLoss: averageLoss,
            close: prevClose
          }
        };
      },
      (value, meta: {
        averageGain: number;
        averageLoss: number;
        close: number;
      }) => {
        const close = candles.getOffset(offset).close;
        const change = Util.change(meta.close, close) * 100;

        let currentGain = 0, currentLoss = 0;

        if (change > 0) {
          currentGain = change;
        } else {
          currentLoss = change * -1;
        }

        const averageGain = (meta.averageGain * 13 + currentGain) / 14;
        const averageLoss = (meta.averageLoss * 13 + currentLoss) / 14;

        const rs = averageGain / averageLoss;
        
        return {
          value: 100 - (100 / (1 + rs)),
          meta: {
            averageGain: averageGain,
            averageLoss: averageLoss,
            close: close
          }
        };
      }
    );
  },
  macd: (candles: Candles, smoothing: number = 9, offset: number = 0): number => {
    const macd = (i: number) => Library.ema(candles, 12, 'close', i + offset) - Library.ema(candles, 26, 'close', i + offset);

    return cache(
      candles,
      `macd-${smoothing}-${offset}`,
      offset,
      () => {
        const maNums = [];

        for (let i = smoothing * 2 - 1; i >= smoothing; i--) {
          maNums.push(macd(i));
        }

        const maValue = ma(maNums);

        const emaNums = [];

        for (let i = smoothing - 1; i >= 0; i--) {
          emaNums.push(macd(i));
        }

        return {
          value: ema(emaNums, maValue),
          meta: null
        };
      },
      (value) => {
        const k = 2 / (smoothing + 1);
        return {
          value: (macd(0) * k) + (value * (1 - k)),
          meta: null
        };
      }
    )
  },
  cci: (candles: Candles, length: number, offset: number = 0): number => {
    let movingAverage = 0;
    let typicalPrice = 0;

    for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
      const candle = candles.get(i);

      typicalPrice = (candle.high + candle.low + candle.close) / 3;
      movingAverage += typicalPrice / length;
    }

    let meanDeviation = 0;

    for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
      const candle = candles.get(i);

      typicalPrice = (candle.high + candle.low + candle.close) / 3;
      meanDeviation += Math.abs(typicalPrice - movingAverage) / length;
    }

    return (typicalPrice - movingAverage) / (0.015 * meanDeviation);
  },
  heikinAshi: (candles: Candles, length: number, offset: number = 0): OHLCCandles => {
    const result: OHLC[] = [];

    for (let i = candles.length - length - offset; i < candles.length - offset; i++) {
      if (i === 0) continue;

      const candle = candles.get(i);
      const prevCandle = candles.get(i - 1);

      const close = (candle.open + candle.high + candle.low + candle.low) / 4;
      const open = (prevCandle.open + prevCandle.close) / 2;
      const high = Math.max(candle.high, candle.open, candle.close);
      const low = Math.min(candle.low, candle.open, candle.close);

      result.push({
        time: candle.time,
        open,
        high,
        low, 
        close
      });
    }

    return new OHLCCandles(result, candles.interval);
  }
}