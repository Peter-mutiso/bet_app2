import { Module, forwardRef } from '@nestjs/common';

import { WebsocketModule } from '../websocket/websocket.module';
import { TradesModule } from '../trades/trades.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { LiveMarketService } from './services/live-market.service';
import { MarketEngineService } from './services/market-engine.service';
import { TickGeneratorService } from './services/tick-generator.service';

@Module({
  imports: [
    WebsocketModule,
    forwardRef(() => TradesModule),
  ],
  controllers: [
    MarketController,
  ],
  providers: [
    MarketService,
    MarketEngineService,
    TickGeneratorService,
    LiveMarketService,
  ],
  exports: [
    MarketService,
    MarketEngineService,
    TickGeneratorService,
    LiveMarketService,
  ],
})
export class MarketModule {}