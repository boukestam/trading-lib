import { Candles } from "./Candles";
export declare const Library: {
    ma: (candles: Candles, length: number, source?: 'low' | 'high' | 'close' | 'open', offset?: number) => number;
    ema: (candles: Candles, length: number, source?: 'low' | 'high' | 'close' | 'open', offset?: number) => number;
    atr: (candles: Candles, length: number, offset?: number) => number;
    lowest: (candles: Candles, length: number, offset?: number) => number;
    highest: (candles: Candles, length: number, offset?: number) => number;
    adx: (candles: Candles, length: number, offset?: number) => number;
    roc: (candles: Candles, length: number, offset?: number) => number;
};
