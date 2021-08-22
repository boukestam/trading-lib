import { Util } from './Util';
import { Logger } from './Logger';
import { Provider } from './Provider';
import { Settings } from './Settings';
import { Script } from './Script';

export interface Signal {
  direction: 'long' | 'short';
  limit: number | 'market';
  stop: number;
  profit: number;
  meta: { [key: string]: any };
}

export async function updateStrategy (provider: Provider, script: Script, settings: Settings) {
  const date = provider.getDate();
  await provider.updatePrices();

  await provider.update();

  let openPositions = await provider.getPositions();
  const orders = [];

  for (const pair of provider.pairs) {
    if (!pair.active) continue;

    if (!pair.nextCheck) {
      const d = new Date(date);
      d.setUTCHours(0,0,0,0);
      let t = d.getTime();
      while (date.getTime() > t) {
        t += pair.intervalTime;
      }

      pair.nextCheck = t;
    } else if (date.getTime() >= pair.nextCheck) {
      const positions = openPositions.filter(position => position.pair === pair && !position.closed);

      let signal: Signal | undefined;
      
      try {
        signal = await script.scan(provider, pair, positions, {
          positions: openPositions,
          equity: await provider.getPortfolioSize(),
          balance: await provider.getAvailableBalance(),
          time: date
        });
      } catch (e) {
        console.error(`Error while scanning symbol ${pair.symbol} at ${date}`);
        throw e;
      }

      if (signal) {
        Logger.log(`Found new signal on ${pair.symbol}`);
        Logger.obj(signal);

        const limitPrice = signal.limit === 'market' ? pair.price : signal.limit;

        if (
          signal.limit !== 'market' && (
            (signal.direction === 'long' && pair.price > signal.limit) ||
            (signal.direction === 'short' && pair.price < signal.limit)
          )
        ) {
          Logger.log(`Price is already over signal limit, no action taken`);
        } else if (
          (signal.direction === 'long' && pair.price < signal.stop) ||
          (signal.direction === 'short' && pair.price > signal.stop)
        ) {
          Logger.log(`Price is already under signal stop, no action taken`);
        } else if (
          openPositions.some(position => 
            position.pair === pair && 
            position.direction === signal?.direction && 
            Math.abs(Util.change(position.limit, limitPrice)) < 0.001
          )
        ) {
          Logger.log(`Position already exists, no action taken`);
        } else {
          const portfolioSize = await provider.getPortfolioSize();
          const maxRisk = portfolioSize * settings.risk;

          const amount = maxRisk / Math.abs(signal.stop - limitPrice);

          for (const position of positions) {
            if (position.direction === signal.direction) continue;

            if (position.filled && !position.closed) {
              Logger.log(`Closing position because opposing signal found`);
              await provider.closePosition(position);
            } else {
              Logger.log(`Cancelling order because opposing signal found`);
              await provider.cancelOrder(position);
            }
          }

          const riskReward = signal.direction === 'long' ? 
            (signal.profit - limitPrice) / (limitPrice - signal.stop) : 
            (limitPrice - signal.profit) / (signal.stop -limitPrice)
          ;

          if (settings.directions.some(direction => signal?.direction === direction)) {
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
      Logger.log(`Next signal check for ${pair.symbol} is at ${new Date(pair.nextCheck)}`);
    }
  }

  openPositions = openPositions.filter(p => !p.closed);

  if (orders.length > 0) {
    orders.sort((a, b) => b.riskReward - a.riskReward);

    let positionCount = openPositions.length;
    
    for (const order of orders) {
      let {pair, signal, amount, portfolioSize} = order;
      const limitPrice = signal.limit === 'market' ? pair.price : signal.limit;
      let cost = ((amount * limitPrice) / settings.leverage) + (amount * limitPrice * settings.fee);

      const portfolio = await provider.getPortfolioSize();
      const balance = await provider.getAvailableBalance();

      if (cost > settings.maxCost * portfolio) {
        amount = ((settings.maxCost * portfolio) * settings.leverage) / (settings.fee * settings.leverage * limitPrice + limitPrice);
        cost = settings.maxCost * portfolio;
      }

      while (positionCount >= settings.maxPositions && openPositions.length > 0) {
        const sorted = [...openPositions].sort((a, b) => (a.profits || 0) - (b.profits || 0));
        await provider.closePosition(sorted[0], undefined, 1, 'Closed to make space for next trade');
        openPositions.splice(openPositions.indexOf(sorted[0]), 1);
        positionCount--;
      }

      if (balance - cost >= portfolioSize * settings.minBalance && positionCount < settings.maxPositions) {
        try {
          await provider.order(pair, signal.direction, signal.limit, signal.stop, amount, signal.meta);
          positionCount++;
        } catch (e) {
          Logger.log('Error while creating order');
          Logger.log(e.toString());
        }
      } else {
        Logger.log(`Not opening position because not enough balance cost = ${cost} balance = (${balance}/${portfolioSize})`);
      }
    }
  }

  openPositions = openPositions.filter(p => !p.closed);

  for (const position of openPositions) {
    if (
      !position.filled &&
      position.buyOrderDate && 
      date.getTime() > position.buyOrderDate.getTime() + position.pair.intervalTime * settings.maxCandlesToBuy
    ) {
      Logger.log(`Cancelling order because it took more than ${settings.maxCandlesToBuy} candles to buy`);
      await provider.cancelOrder(position);
    }

    if (position.filled && !position.closed) {
      await script.update(provider, position, position.pair.price);
    }
  }
}