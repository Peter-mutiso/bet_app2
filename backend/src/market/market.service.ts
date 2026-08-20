import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { MarketEngineService } from './services/market-engine.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { TradeEngineService } from '../trades/engine/trade-engine.service';

@Injectable()
export class MarketService {

  private latestTick: any;

  constructor(
    private readonly engine: MarketEngineService,
    private readonly gateway: WebsocketGateway,
    private readonly tradeEngine: TradeEngineService,
  ) {}
  async getAvailableMarkets() {
    return ["R_100", "R_50", "R_25", "R_10"];
  }
@Interval(300)
async generateTick() {
  

  const tick = await this.engine.getTick("R_100");

  

  if (!tick) {
    console.log("Tick is null");
    return;
  }

  this.latestTick = tick;

  await this.tradeEngine.processTick(
    "R_100",
    tick.price,
    tick.digit,
  );

  

  this.gateway.broadcastTick(tick);
}

  getCurrentTick() {
    return this.latestTick;
  }
}