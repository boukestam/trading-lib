import { Library } from "./Library";
import { Pair } from "./Pair";
import { Provider } from "./Provider";
import { getSR } from "./SR";
import { Signal } from "./Strategy";
import { Trade } from "./Trade";
import { Util } from "./Util";

export interface Script {
  options: Record<string, any>;
  optimize: Record<string, {
    min: number;
    max: number;
    step: number;
    values: string[];
  }>;
  scan: (provider: Provider, pair: Pair, positions: Trade[], strategy: {
    positions: Trade[];
    equity: number;
    balance: number;
    time: Date;
  }) => Promise<Signal | undefined>;
  update: (provider: Provider, position: Trade, price: number) => Promise<void>;
  plot: (provider: Provider, pair: Pair, plot: (value: number, type: 'line' | 'bar') => void) => Promise<void>;
}

export const compileScript = function (scriptCode: string): Script {
  const scriptSource = eval(`(function (exports, setStopLoss, getSR, getCandles, closePosition, lib, util) {
    ${scriptCode}
  })`);
  
  const script: Script = {
    options: {},
    optimize: {},
    scan: async (provider: Provider, pair: Pair, positions: Trade[], strategy: {
      positions: Trade[];
      equity: number;
      balance: number;
      time: Date;
    }): Promise<Signal | undefined> => {
      return;
    },
    update: async (provider: Provider, position: Trade, price: number) => {
      return;
    },
    plot: async (provider: Provider, pair: Pair, plot: (value: number, type: 'line' | 'bar') => void) => {
      return;
    }
  }; 
  
  scriptSource(
    script, 
    async (provider: Provider, position: Trade, stop: number) => {
      await provider.moveStop(position, stop);
    }, 
    getSR, 
    async (provider: Provider, pair: Pair, interval: string) => {
      return await provider.getCandles(pair, interval);
    },
    async (provider: Provider, position: Trade, note?: string) => {
      await provider.closePosition(position, undefined, note);
    }, 
    Library,
    Util
  );

  return script;
};