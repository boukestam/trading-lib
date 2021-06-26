import { Pair } from "./Pair";
import { Provider } from "./Provider";
import { Signal } from "./Strategy";
import { Trade } from "./Trade";
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
export declare const compileScript: (scriptCode: string) => Script;
