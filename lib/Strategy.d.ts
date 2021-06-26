import { Provider } from './Provider';
import { Settings } from './Settings';
import { Script } from './Script';
export interface Signal {
    direction: 'long' | 'short';
    limit: number | 'market';
    stop: number;
    profit: number;
    meta: {
        [key: string]: any;
    };
}
export declare function updateStrategy(provider: Provider, script: Script, settings: Settings): Promise<void>;
