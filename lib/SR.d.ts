import { Candles } from "./Candles";
export interface SRStrategySettings {
    method: 'closes' | 'wicks';
    interval: string;
    lookback: number;
    minDistance: number;
    steps: number;
}
export interface SR {
    price: number;
    touches: number;
}
export declare function getSR(candles: Candles, min: number, max: number, settings: SRStrategySettings): SR[];
