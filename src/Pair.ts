import { Candles } from "./Candles";

export interface Pair {
    symbol: string;
    interval: string;
    intervalTime: number;
    active: boolean;
    price: number;
    nextCheck?: number;
};