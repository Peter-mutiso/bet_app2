import { Module, forwardRef } from '@nestjs/common';
import { WebsocketModule } from '../websocket/websocket.module';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';

import { SettlementService } from './engine/settlement.service';
import { TradeEngineService } from './engine/trade-engine.service';

import { WalletModule } from '../wallet/wallet.module';
import { PrismaModule } from '../common/prisma/prisma.module';
import { MarketModule } from '../market/market.module';



@Module({

  imports: [

    PrismaModule,

    forwardRef(() => MarketModule),
     WebsocketModule,
    WalletModule,

  ],


  controllers: [

    TradesController,

  ],


  providers: [

    TradesService,

    TradeEngineService,

    SettlementService,

  ],


  exports: [

    TradeEngineService,

    SettlementService,

  ],


})

export class TradesModule {}