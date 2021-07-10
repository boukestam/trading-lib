import { Candles } from "./Candles";
import { OHLC } from "./OHLC";
import { OHLCCandles } from "./OHLCCandles";
export declare const Library: {
    trueRange: (current: OHLC, previous: OHLC) => number;
    ma: (candles: Candles, length: number, source?: 'low' | 'high' | 'close' | 'open', offset?: number) => number;
    ema: (candles: Candles, length: number, source?: 'low' | 'high' | 'close' | 'open', offset?: number) => number;
    atr: (candles: Candles, length: number, offset?: number) => number;
    lowest: (candles: Candles, length: number, source?: 'low' | 'high' | 'close' | 'open', offset?: number) => number;
    highest: (candles: Candles, length: number, source?: 'low' | 'high' | 'close' | 'open', offset?: number) => number;
    dmi: (candles: Candles, length: number, offset?: number) => number[];
    roc: (candles: Candles, length: number, offset?: number) => number;
    rsi: (candles: Candles, length: number, offset?: number) => number;
    macd: (candles: Candles, smoothing?: number, offset?: number) => number;
    cci: (candles: Candles, length: number, offset?: number) => number;
    heikinAshi: (candles: Candles, length: number, offset?: number) => OHLCCandles;
};
