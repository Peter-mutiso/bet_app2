import { Injectable } from '@nestjs/common';
import { TickGeneratorService } from './tick-generator.service';

@Injectable()
export class MarketEngineService {
  constructor(
    private readonly tickGenerator: TickGeneratorService,
  ) {}

  getTick(symbol: string) {
    return this.tickGenerator.generateTick(symbol);
  }

  getAllMarkets() {
    return this.tickGenerator.getSymbols().map((symbol) => ({
      symbol,
      tick: this.tickGenerator.generateTick(symbol),
    }));
  }
}