import { OHLC } from "./OHLC";
export interface Candles {
    length: number;
    forEach(callback: (candle: OHLC) => void): void;
    get(index: number): OHLC;
    getIndexOfTime(time: number): number;
    minMax(): number[];
    range(start: number, end: number): Candles;
    transform(interval: string): Candles;
}
