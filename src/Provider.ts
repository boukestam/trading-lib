import { Candles } from "./Candles";
import { Pair } from "./Pair";
import { Trade } from "./Trade";

export interface CandleResult {
  candles: Candles; 
  min: number; 
  max: number;
}

export interface Provider {
  pairs: Pair[];

  getDate (): Date;

  getCandles (pair: Pair, interval: string): Promise<CandleResult>;

  updatePrices (): Promise<void>;

  order (pair: Pair, direction: 'long' | 'short', limit: number | 'market', stop: number, amount: number, signal: any): Promise<void>;

  cancelOrder (order: Trade): Promise<void>;

  closePosition (position: Trade, limitPrice?: number, note?: string): Promise<void>;

  getBalance (): Promise<number>;

  getAvailableBalance (): Promise<number>;

  getPortfolioSize (): Promise<number>;

  getPositions (): Promise<Trade[]>;

  moveStop (position: Trade, stop: number): Promise<void>;

  update (): Promise<void>;
}