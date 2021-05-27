"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileScript = void 0;
const Library_1 = require("./Library");
const SR_1 = require("./SR");
const Util_1 = require("./Util");
const compileScript = function (scriptCode) {
    const scriptSource = eval(`(function (exports, setStopLoss, getSR, getCandles, closePosition, lib, util) {
    ${scriptCode}
  })`);
    const script = {
        options: {},
        optimize: {},
        scan: async (provider, pair, positions, allPositions) => {
            return;
        },
        update: async (provider, position, price) => {
            return;
        }
    };
    scriptSource(script, async (provider, position, stop) => {
        await provider.moveStop(position, stop);
    }, SR_1.getSR, async (provider, pair, interval) => {
        return await provider.getCandles(pair, interval);
    }, async (provider, position, note) => {
        await provider.closePosition(position, undefined, note);
    }, Library_1.Library, Util_1.Util);
    return script;
};
exports.compileScript = compileScript;
