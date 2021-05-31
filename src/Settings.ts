export interface Settings {
  interval: string;
  fee: number;
  leverage: number;
  risk: number;
  maxCost: number;
  minBalance: number;
  maxCandlesToBuy: number;
  fixedProfit: number;
  maxPositions: number;
  directions: string[];
}