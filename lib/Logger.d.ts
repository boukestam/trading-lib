declare class ConsoleLogger {
    verbose: boolean;
    logs: string[];
    constructor(verbose: boolean);
    log(message: string): void;
    error(message: string): void;
    obj(obj: any): void;
}
export declare const Logger: ConsoleLogger;
export {};
