import { OHLC } from "./OHLC";
export interface Cache {
    [indicator: string]: {
        time: number;
        value: number;
        meta: any;
    };
}
export interface Candles {
    length: number;
    interval: string;
    intervalTime: number;
    cache: Cache;
    forEach(callback: (candle: OHLC) => void): void;
    get(index: number): OHLC;
    getOffset(offset: number): OHLC;
    getIndexOfTime(time: number): number;
    minMax(): number[];
    range(start: number, end: number): Candles;
    transform(interval: string): Candles;
}
