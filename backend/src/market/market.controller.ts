import { Controller, Get, Param } from '@nestjs/common';
import { MarketEngineService } from './services/market-engine.service';

@Controller('market')
export class MarketController {
  constructor(
    private readonly engine: MarketEngineService,
  ) {}

  @Get()
  getMarkets() {
    return this.engine.getAllMarkets();
  }

  @Get(':symbol')
  getMarket(@Param('symbol') symbol: string) {
    return this.engine.getTick(symbol);
  }
}