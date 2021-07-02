import { Candles } from "./Candles";
import { History } from "./History";
import { Pair } from "./Pair";
import { Trade } from "./Trade";
export interface Provider {
    pairs: Pair[];
    getDate(): Date;
    getCandles(pair: Pair, interval: string): Promise<Candles>;
    updatePrices(): Promise<void>;
    order(pair: Pair, direction: 'long' | 'short', limit: number | 'market', stop: number, amount: number, meta: {
        [key: string]: any;
    }): Promise<void>;
    cancelOrder(order: Trade): Promise<void>;
    closePosition(position: Trade, limitPrice?: number, ratio?: number, note?: string): Promise<void>;
    getBalance(): Promise<number>;
    getAvailableBalance(): Promise<number>;
    getPortfolioSize(): Promise<number>;
    getPositions(): Promise<Trade[]>;
    getHistory(): Promise<History[]>;
    moveStop(position: Trade, stop: number): Promise<void>;
    update(): Promise<void>;
}
