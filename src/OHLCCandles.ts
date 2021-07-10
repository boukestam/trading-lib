import { Cache, Candles } from "./Candles";
import { OHLC } from "./OHLC";
import { Util } from "./Util";

export class OHLCCandles implements Candles {
  candles: OHLC[];
  length: number;
  interval: string;
  intervalTime: number;
  cache: Cache;

  constructor(candles: OHLC[], interval: string, cache: Cache = {}) {
    this.candles = candles;
    this.interval = interval;
    this.intervalTime = Util.intervalToMs(interval);
    this.length = candles.length;
    this.cache = cache;
  }

  forEach(callback: (candle: OHLC) => void): void {
    for (const candle of this.candles) {
      callback(candle);
    }
  }

  get(index: number): OHLC {
    return this.candles[index];
  }

  getOffset(offset: number): OHLC {
    return this.candles[this.candles.length - 1 - offset];
  }

  getIndexOfTime(time: number): number {
    return this.candles.findIndex(candle => candle.time >= time);
  }

  minMax(): number[] {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    for(const candle of this.candles) {
      if (candle.low < min) min = candle.low;
      if (candle.high > max) max = candle.high;
    }

    return [min, max];
  }

  range(start: number, end: number): Candles {
    return new OHLCCandles(this.candles.slice(Math.max(start, 0), Math.max(start, end)), this.interval, this.cache);
  }

  transform(interval: string): Candles {
    if (interval === this.interval) return this;

    const intervalTime = Util.intervalToMs(interval);

    const output: OHLC[] = [];
    let foundFirst = false;

    this.forEach(stick => {
      const date = new Date(stick.time * 1000);

      if (!foundFirst) {
        if (date.getHours() == 0 && date.getMinutes() == 0) {
          foundFirst = true;
        } else {
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

      const current = output[output.length - 1];
      current.low = Math.min(current.low, stick.low);
      current.high = Math.max(current.high, stick.high);
      current.close = stick.close;
    });

    return new OHLCCandles(output, interval);
  }
};