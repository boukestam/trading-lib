"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class ConsoleLogger {
    constructor(verbose) {
        this.verbose = verbose;
        this.logs = [];
    }
    log(message) {
        if (this.verbose) {
            this.logs.push(`${new Date()}: ${message}`);
            this.logs = this.logs.splice(-1000);
            console.log(`${new Date()}: ${message}`);
        }
    }
    error(message) {
        this.logs.push(`${new Date()}: ${message}`);
        this.logs = this.logs.splice(-1000);
        console.error(`${new Date()}: ${message}`);
    }
    obj(obj) {
        if (this.verbose) {
            this.logs.push(typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj);
            this.logs = this.logs.splice(-1000);
            console.log(obj);
        }
    }
}
;
exports.Logger = new ConsoleLogger(false);
