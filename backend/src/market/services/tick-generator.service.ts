import { Injectable } from '@nestjs/common';

export interface Tick {
  symbol: string;
  price: number;
  digit: number;
  timestamp: number;
}

interface MarketState {
  symbol: string;
  price: number;
  volatility: number;
  trend: number;
}

@Injectable()
export class TickGeneratorService {
  private readonly markets = new Map<string, MarketState>();

  constructor() {
    this.initializeMarkets();
  }

  private initializeMarkets() {
    this.addMarket('R_10', 1000, 0.15);
    this.addMarket('R_25', 1200, 0.30);
    this.addMarket('R_50', 1500, 0.50);
    this.addMarket('R_75', 1800, 0.75);
    this.addMarket('R_100', 2000, 1.00);
  }

  private addMarket(symbol: string, price: number, volatility: number) {
    this.markets.set(symbol, {
      symbol,
      price,
      volatility,
      trend: 0,
    });
  }

  generateTick(symbol: string): Tick | null {
    const market = this.markets.get(symbol);

    if (!market) {
      return null;
    }

    market.trend += (Math.random() - 0.5) * 0.02;

    market.trend = Math.max(-1, Math.min(1, market.trend));

    const noise =
      (Math.random() - 0.5) *
      market.volatility;

    const movement =
      market.trend +
      noise;

    market.price += movement;

    if (market.price < 10) {
      market.price = 10;
    }

    const rounded =
      Number(market.price.toFixed(4));

    return {
      symbol: market.symbol,
      price: rounded,
      digit: Number(
        rounded
          .toFixed(4)
          .slice(-1),
      ),
      timestamp: Date.now(),
    };
  }

  getSymbols() {
    return [...this.markets.keys()];
  }
}