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
    }>;
    scan: (provider: Provider, pair: Pair, positions: Trade[], allPositions: Trade[]) => Promise<Signal | undefined>;
    update: (provider: Provider, position: Trade, price: number) => Promise<void>;
}
export declare const compileScript: (scriptCode: string) => Script;
