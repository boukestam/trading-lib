"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStrategy = void 0;
const Util_1 = require("./Util");
const Logger_1 = require("./Logger");
async function updateStrategy(provider, script, settings) {
    const date = provider.getDate();
    await provider.updatePrices();
    await provider.update();
    const openPositions = await provider.getPositions();
    const orders = [];
    for (const pair of provider.pairs) {
        if (!pair.active)
            continue;
        if (!pair.nextCheck) {
            const d = new Date(date);
            d.setUTCHours(0, 0, 0, 0);
            let t = d.getTime();
            while (date.getTime() > t) {
                t += pair.intervalTime;
            }
            pair.nextCheck = t;
        }
        else if (date.getTime() >= pair.nextCheck) {
            const positions = openPositions.filter(position => position.pair === pair);
            const signal = await script.scan(provider, pair, positions, openPositions);
            if (signal) {
                Logger_1.Logger.log(`Found new signal on ${pair.symbol}`);
                Logger_1.Logger.obj(signal);
                const limitPrice = signal.limit === 'market' ? pair.price : signal.limit;
                if (signal.limit !== 'market' && ((signal.direction === 'long' && pair.price > signal.limit) ||
                    (signal.direction === 'short' && pair.price < signal.limit))) {
                    Logger_1.Logger.log(`Price is already over signal limit, no action taken`);
                }
                else if ((signal.direction === 'long' && pair.price < signal.stop) ||
                    (signal.direction === 'short' && pair.price > signal.stop)) {
                    Logger_1.Logger.log(`Price is already under signal stop, no action taken`);
                }
                else if (openPositions.some(position => position.pair === pair &&
                    position.direction === signal.direction &&
                    Math.abs(Util_1.Util.change(position.limit, limitPrice)) < 0.001)) {
                    Logger_1.Logger.log(`Position already exists, no action taken`);
                }
                else {
                    const portfolioSize = await provider.getPortfolioSize();
                    const maxRisk = portfolioSize * settings.risk;
                    const amount = maxRisk / Math.abs(signal.stop - limitPrice);
                    for (const position of positions) {
                        if (position.direction === signal.direction)
                            continue;
                        if (position.filled) {
                            Logger_1.Logger.log(`Closing position because opposing signal found`);
                            await provider.closePosition(position);
                        }
                        else {
                            Logger_1.Logger.log(`Cancelling order because opposing signal found`);
                            await provider.cancelOrder(position);
                        }
                    }
                    const riskReward = signal.direction === 'long' ?
                        (signal.profit - limitPrice) / (limitPrice - signal.stop) :
                        (limitPrice - signal.profit) / (signal.stop - limitPrice);
                    if (settings.directions.some(direction => signal.direction === direction)) {
                        orders.push({
                            pair,
                            signal,
                            amount,
                            riskReward,
                            portfolioSize
                        });
                    }
                }
            }
            pair.nextCheck += pair.intervalTime;
            Logger_1.Logger.log(`Next signal check for ${pair.symbol} is at ${new Date(pair.nextCheck)}`);
        }
    }
    if (orders.length > 0) {
        orders.sort((a, b) => b.riskReward - a.riskReward);
        for (const order of orders) {
            let { pair, signal, amount, portfolioSize } = order;
            const limitPrice = signal.limit === 'market' ? pair.price : signal.limit;
            let cost = ((amount * limitPrice) / settings.leverage) + (amount * limitPrice * settings.fee);
            // TODO: use available balance?
            const portfolio = await provider.getPortfolioSize();
            const balance = await provider.getBalance();
            if (cost > settings.maxCost * portfolio) {
                amount = ((settings.maxCost * portfolio) * settings.leverage) / (settings.fee * settings.leverage * limitPrice + limitPrice);
                cost = settings.maxCost * portfolio;
            }
            if (balance - cost >= portfolioSize * settings.minBalance) {
                try {
                    await provider.order(pair, signal.direction, signal.limit, signal.stop, amount, signal);
                }
                catch (e) {
                    Logger_1.Logger.log(e.toString());
                }
            }
            else {
                Logger_1.Logger.log(`Not opening position because not enough balance cost = ${cost} balance = (${balance}/${portfolioSize})`);
            }
        }
    }
    for (const position of openPositions) {
        if (!position.filled &&
            position.buyOrderDate &&
            date.getTime() > position.buyOrderDate.getTime() + position.pair.intervalTime * settings.maxCandlesToBuy) {
            Logger_1.Logger.log(`Cancelling order because it took more than ${settings.maxCandlesToBuy} candles to buy`);
            await provider.cancelOrder(position);
        }
        if (position.filled && !position.closed) {
            await script.update(provider, position, position.pair.price);
        }
    }
}
exports.updateStrategy = updateStrategy;
