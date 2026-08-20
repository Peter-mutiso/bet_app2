import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { TickGeneratorService } from './tick-generator.service';
import { TradeEngineService } from '../../trades/engine/trade-engine.service';
import { WebsocketGateway } from '../../websocket/websocket.gateway';

@Injectable()
export class LiveMarketService
  implements OnModuleInit
{

  private readonly logger =
    new Logger(LiveMarketService.name);


  private latestTicks =
    new Map<string, any>();


  constructor(
    private readonly generator: TickGeneratorService,
    private readonly gateway: WebsocketGateway,
    private readonly tradeEngine: TradeEngineService,
  ) {}



  onModuleInit() {

    // Allow websocket and dependencies to initialize first
    setTimeout(() => {
      this.start();
    }, 2000);

  }



  private start() {

    setInterval(async () => {


      for (
        const symbol of this.generator.getSymbols()
      ) {


        const tick =
          this.generator.generateTick(symbol);



        if (!tick) {
          continue;
        }



        // Store latest market price
        this.latestTicks.set(
          symbol,
          tick,
        );



        // Send tick to frontend
        this.gateway.broadcastTick(
          tick,
        );



        // Process open trades
        try {

          await this.tradeEngine.processTick(
            tick.symbol,
            tick.price,
            tick.digit,
          );


        } catch (error) {

          this.logger.error(
            'Trade settlement processing failed',
            error,
          );

        }

      }



      // Broadcast all markets
      this.gateway.broadcastMarkets(
        this.getAllTicks(),
      );



    }, 1000);



    this.logger.log(
      'Live Market Engine Started',
    );

  }



  getLatestTick(symbol: string) {

    return this.latestTicks.get(
      symbol,
    );

  }



  getAllTicks() {

    return [
      ...this.latestTicks.values(),
    ];

  }

}