"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStrategy = void 0;
var Util_1 = require("./Util");
var Logger_1 = require("./Logger");
function updateStrategy(provider, script, settings) {
    return __awaiter(this, void 0, void 0, function () {
        var date, openPositions, orders, _loop_1, _i, _a, pair, positionCount, _b, orders_1, order, pair, signal, amount, portfolioSize, limitPrice, cost, portfolio, balance, sorted, e_1, _c, openPositions_1, position;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    date = provider.getDate();
                    return [4 /*yield*/, provider.updatePrices()];
                case 1:
                    _d.sent();
                    return [4 /*yield*/, provider.update()];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, provider.getPositions()];
                case 3:
                    openPositions = _d.sent();
                    orders = [];
                    _loop_1 = function (pair) {
                        var d, t, positions, signal_1, _e, _f, _g, e_2, limitPrice_1, portfolioSize, maxRisk, amount, _h, positions_1, position, riskReward;
                        var _j;
                        return __generator(this, function (_k) {
                            switch (_k.label) {
                                case 0:
                                    if (!pair.active)
                                        return [2 /*return*/, "continue"];
                                    if (!!pair.nextCheck) return [3 /*break*/, 1];
                                    d = new Date(date);
                                    d.setUTCHours(0, 0, 0, 0);
                                    t = d.getTime();
                                    while (date.getTime() > t) {
                                        t += pair.intervalTime;
                                    }
                                    pair.nextCheck = t;
                                    return [3 /*break*/, 19];
                                case 1:
                                    if (!(date.getTime() >= pair.nextCheck)) return [3 /*break*/, 19];
                                    positions = openPositions.filter(function (position) { return position.pair === pair && !position.closed; });
                                    _k.label = 2;
                                case 2:
                                    _k.trys.push([2, 6, , 7]);
                                    _f = (_e = script).scan;
                                    _g = [provider, pair, positions];
                                    _j = {
                                        positions: openPositions
                                    };
                                    return [4 /*yield*/, provider.getPortfolioSize()];
                                case 3:
                                    _j.equity = _k.sent();
                                    return [4 /*yield*/, provider.getBalance()];
                                case 4: return [4 /*yield*/, _f.apply(_e, _g.concat([(_j.balance = _k.sent(),
                                            _j.time = date,
                                            _j)]))];
                                case 5:
                                    signal_1 = _k.sent();
                                    return [3 /*break*/, 7];
                                case 6:
                                    e_2 = _k.sent();
                                    console.error("Error while scanning symbol " + pair.symbol + " at " + date);
                                    throw e_2;
                                case 7:
                                    if (!signal_1) return [3 /*break*/, 18];
                                    Logger_1.Logger.log("Found new signal on " + pair.symbol);
                                    Logger_1.Logger.obj(signal_1);
                                    limitPrice_1 = signal_1.limit === 'market' ? pair.price : signal_1.limit;
                                    if (!(signal_1.limit !== 'market' && ((signal_1.direction === 'long' && pair.price > signal_1.limit) ||
                                        (signal_1.direction === 'short' && pair.price < signal_1.limit)))) return [3 /*break*/, 8];
                                    Logger_1.Logger.log("Price is already over signal limit, no action taken");
                                    return [3 /*break*/, 18];
                                case 8:
                                    if (!((signal_1.direction === 'long' && pair.price < signal_1.stop) ||
                                        (signal_1.direction === 'short' && pair.price > signal_1.stop))) return [3 /*break*/, 9];
                                    Logger_1.Logger.log("Price is already under signal stop, no action taken");
                                    return [3 /*break*/, 18];
                                case 9:
                                    if (!openPositions.some(function (position) {
                                        return position.pair === pair &&
                                            position.direction === (signal_1 === null || signal_1 === void 0 ? void 0 : signal_1.direction) &&
                                            Math.abs(Util_1.Util.change(position.limit, limitPrice_1)) < 0.001;
                                    })) return [3 /*break*/, 10];
                                    Logger_1.Logger.log("Position already exists, no action taken");
                                    return [3 /*break*/, 18];
                                case 10: return [4 /*yield*/, provider.getPortfolioSize()];
                                case 11:
                                    portfolioSize = _k.sent();
                                    maxRisk = portfolioSize * settings.risk;
                                    amount = maxRisk / Math.abs(signal_1.stop - limitPrice_1);
                                    _h = 0, positions_1 = positions;
                                    _k.label = 12;
                                case 12:
                                    if (!(_h < positions_1.length)) return [3 /*break*/, 17];
                                    position = positions_1[_h];
                                    if (position.direction === signal_1.direction)
                                        return [3 /*break*/, 16];
                                    if (!(position.filled && !position.closed)) return [3 /*break*/, 14];
                                    Logger_1.Logger.log("Closing position because opposing signal found");
                                    return [4 /*yield*/, provider.closePosition(position)];
                                case 13:
                                    _k.sent();
                                    return [3 /*break*/, 16];
                                case 14:
                                    Logger_1.Logger.log("Cancelling order because opposing signal found");
                                    return [4 /*yield*/, provider.cancelOrder(position)];
                                case 15:
                                    _k.sent();
                                    _k.label = 16;
                                case 16:
                                    _h++;
                                    return [3 /*break*/, 12];
                                case 17:
                                    riskReward = signal_1.direction === 'long' ?
                                        (signal_1.profit - limitPrice_1) / (limitPrice_1 - signal_1.stop) :
                                        (limitPrice_1 - signal_1.profit) / (signal_1.stop - limitPrice_1);
                                    if (settings.directions.some(function (direction) { return (signal_1 === null || signal_1 === void 0 ? void 0 : signal_1.direction) === direction; })) {
                                        orders.push({
                                            pair: pair,
                                            signal: signal_1,
                                            amount: amount,
                                            riskReward: riskReward,
                                            portfolioSize: portfolioSize
                                        });
                                    }
                                    _k.label = 18;
                                case 18:
                                    pair.nextCheck += pair.intervalTime;
                                    Logger_1.Logger.log("Next signal check for " + pair.symbol + " is at " + new Date(pair.nextCheck));
                                    _k.label = 19;
                                case 19: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = provider.pairs;
                    _d.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    pair = _a[_i];
                    return [5 /*yield**/, _loop_1(pair)];
                case 5:
                    _d.sent();
                    _d.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    openPositions = openPositions.filter(function (p) { return !p.closed; });
                    if (!(orders.length > 0)) return [3 /*break*/, 20];
                    orders.sort(function (a, b) { return b.riskReward - a.riskReward; });
                    positionCount = openPositions.length;
                    _b = 0, orders_1 = orders;
                    _d.label = 8;
                case 8:
                    if (!(_b < orders_1.length)) return [3 /*break*/, 20];
                    order = orders_1[_b];
                    pair = order.pair, signal = order.signal, amount = order.amount, portfolioSize = order.portfolioSize;
                    limitPrice = signal.limit === 'market' ? pair.price : signal.limit;
                    cost = ((amount * limitPrice) / settings.leverage) + (amount * limitPrice * settings.fee);
                    return [4 /*yield*/, provider.getPortfolioSize()];
                case 9:
                    portfolio = _d.sent();
                    return [4 /*yield*/, provider.getAvailableBalance()];
                case 10:
                    balance = _d.sent();
                    if (cost > settings.maxCost * portfolio) {
                        amount = ((settings.maxCost * portfolio) * settings.leverage) / (settings.fee * settings.leverage * limitPrice + limitPrice);
                        cost = settings.maxCost * portfolio;
                    }
                    _d.label = 11;
                case 11:
                    if (!(positionCount >= settings.maxPositions && openPositions.length > 0)) return [3 /*break*/, 13];
                    sorted = __spreadArray([], openPositions).sort(function (a, b) { return (a.profits || 0) - (b.profits || 0); });
                    return [4 /*yield*/, provider.closePosition(sorted[0])];
                case 12:
                    _d.sent();
                    openPositions.splice(openPositions.indexOf(sorted[0]), 1);
                    positionCount--;
                    return [3 /*break*/, 11];
                case 13:
                    if (!(balance - cost >= portfolioSize * settings.minBalance && positionCount < settings.maxPositions)) return [3 /*break*/, 18];
                    _d.label = 14;
                case 14:
                    _d.trys.push([14, 16, , 17]);
                    return [4 /*yield*/, provider.order(pair, signal.direction, signal.limit, signal.stop, amount, signal.meta)];
                case 15:
                    _d.sent();
                    positionCount++;
                    return [3 /*break*/, 17];
                case 16:
                    e_1 = _d.sent();
                    Logger_1.Logger.log(e_1.toString());
                    return [3 /*break*/, 17];
                case 17: return [3 /*break*/, 19];
                case 18:
                    Logger_1.Logger.log("Not opening position because not enough balance cost = " + cost + " balance = (" + balance + "/" + portfolioSize + ")");
                    _d.label = 19;
                case 19:
                    _b++;
                    return [3 /*break*/, 8];
                case 20:
                    openPositions = openPositions.filter(function (p) { return !p.closed; });
                    _c = 0, openPositions_1 = openPositions;
                    _d.label = 21;
                case 21:
                    if (!(_c < openPositions_1.length)) return [3 /*break*/, 26];
                    position = openPositions_1[_c];
                    if (!(!position.filled &&
                        position.buyOrderDate &&
                        date.getTime() > position.buyOrderDate.getTime() + position.pair.intervalTime * settings.maxCandlesToBuy)) return [3 /*break*/, 23];
                    Logger_1.Logger.log("Cancelling order because it took more than " + settings.maxCandlesToBuy + " candles to buy");
                    return [4 /*yield*/, provider.cancelOrder(position)];
                case 22:
                    _d.sent();
                    _d.label = 23;
                case 23:
                    if (!(position.filled && !position.closed)) return [3 /*break*/, 25];
                    return [4 /*yield*/, script.update(provider, position, position.pair.price)];
                case 24:
                    _d.sent();
                    _d.label = 25;
                case 25:
                    _c++;
                    return [3 /*break*/, 21];
                case 26: return [2 /*return*/];
            }
        });
    });
}
exports.updateStrategy = updateStrategy;
