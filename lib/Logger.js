"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var ConsoleLogger = /** @class */ (function () {
    function ConsoleLogger(verbose) {
        this.verbose = verbose;
        this.logs = [];
    }
    ConsoleLogger.prototype.log = function (message) {
        if (this.verbose) {
            this.logs.push(new Date() + ": " + message);
            this.logs = this.logs.splice(-1000);
            console.log(new Date() + ": " + message);
        }
    };
    ConsoleLogger.prototype.error = function (message) {
        this.logs.push(new Date() + ": " + message);
        this.logs = this.logs.splice(-1000);
        console.error(new Date() + ": " + message);
    };
    ConsoleLogger.prototype.obj = function (obj) {
        if (this.verbose) {
            this.logs.push(typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj);
            this.logs = this.logs.splice(-1000);
            console.log(obj);
        }
    };
    return ConsoleLogger;
}());
;
exports.Logger = new ConsoleLogger(false);
