export declare const Util: {
    change: (a: number, b: number) => number;
    sleep: (ms: number) => Promise<void>;
    intervalToMs: (interval: string) => number;
    durationToString: (ms: number) => string;
    avg: (nums: number[]) => number;
    sum: (nums: number[]) => number;
    minMax: (nums: number[]) => number[];
    numberToString: (num: number) => string;
    timeToString: (time: Date) => string;
};
