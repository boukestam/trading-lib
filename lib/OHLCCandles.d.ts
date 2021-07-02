import { Candles } from "./Candles";
import { OHLC } from "./OHLC";
export declare class OHLCCandles implements Candles {
    candles: OHLC[];
    length: number;
    interval: string;
    constructor(candles: OHLC[], interval: string);
    forEach(callback: (candle: OHLC) => void): void;
    get(index: number): OHLC;
    getOffset(offset: number): OHLC;
    getIndexOfTime(time: number): number;
    minMax(): number[];
    range(start: number, end: number): Candles;
    transform(interval: string): Candles;
}
