import { Candles } from "./Candles";

export interface SRStrategySettings {
  method: 'closes' | 'wicks';
  interval: string;
  lookback: number;
  minDistance: number;
  steps: number;
}

export interface SR {
  price: number;
  touches: number;
}

function detectSR (candles: Candles, min: number, max: number, settings: SRStrategySettings): SR[] {
  if (settings.method === 'closes') {
    const levels: SR[] = [];
    let previous: 'none' | 'green' | 'red' = 'none';
    
    candles.forEach(candle => {
      const maxPrice = Math.max(candle.open, candle.close);
      const minPrice = Math.min(candle.open, candle.close);

      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];

        if (minPrice < level.price && maxPrice > level.price) {
          levels.splice(i, 1);
          i--;
          continue;
        }

        if (candle.high > level.price && maxPrice < level.price) level.touches++;
        if (candle.low < level.price && minPrice > level.price) level.touches++;
      }

      if (candle.open > candle.close && (previous === 'none' || previous === 'red')) {
        previous = 'green';
        levels.push({
          price: candle.open,
          touches: 0
        });
      } else if (candle.open < candle.close && (previous === 'none' || previous === 'green')) {
        previous = 'red';
        levels.push({
          price: candle.open,
          touches: 0
        });
      }
    });

    return levels.sort((a, b) => a.price - b.price);
  } else if (settings.method === 'wicks') {
    const stepSize = (max - min) / settings.steps;
    const minPriceDifference = (settings.minDistance * settings.steps) * stepSize;

    const touches: Record<number, number> = {};

    for (let price = min; price < max; price += stepSize) {
      touches[price] = 0;
    }
  
    candles.forEach(candle => {
      const maxPrice = Math.max(candle.open, candle.close);
      const minPrice = Math.min(candle.open, candle.close);

      for (let price = min; price < max; price += stepSize) {
        if (price < candle.low || price > candle.high) continue;

        if (candle.high > price && maxPrice < price) touches[price]++;
        if (candle.low < price && minPrice > price) touches[price]++;

        if (minPrice < price && maxPrice > price) {
          touches[price]--;
        }
      }
    });

    const levels: {touches: number; price: number}[] = [];

    for (let price = min; price < max; price += stepSize) {
      if (touches[price] > 1) {
        levels.push({
          price,
          touches: touches[price]
        });
      }
    }

    levels.sort((a, b) => {
      if (a.touches < b.touches) return 1;
      if (b.touches > a.touches) return -1;
      return b.price - a.price;
    });

    for (let i = levels.length - 1; i >= 0; i--) {
      if (levels.some((level, levelIndex) => levelIndex !== i && Math.abs(levels[i].price - level.price) < minPriceDifference)) {
        levels.splice(i, 1);
      }
    }

    return levels;
  }

  throw new Error('Unknown SR method');
}

export function getSR (candles: Candles, min: number, max: number, settings: SRStrategySettings) {
  const range = candles.range(candles.length - settings.lookback, candles.length - 2);
  return detectSR(range, min, max, settings);
}