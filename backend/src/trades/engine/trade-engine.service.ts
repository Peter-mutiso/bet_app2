import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';

import { SettlementService } from './settlement.service';



interface ActiveTrade {

  tradeId: string;

  symbol: string;

  remainingTicks: number;

}



@Injectable()
export class TradeEngineService {


  private readonly activeTrades =
    new Map<string, ActiveTrade>();




  constructor(

    private readonly settlement: SettlementService,

    private readonly prisma: PrismaService,

  ) {}







  /**
   * Add a new open trade
   */

  addTrade(

    tradeId: string,

    symbol: string,

    tickDuration: number,

  ): void {


    this.activeTrades.set(

      tradeId,

      {

        tradeId,

        symbol,

        remainingTicks:
          tickDuration,

      }

    );


  }







  /**
   * Called whenever a market tick arrives
   */

  async processTick(

    symbol: string,

    price: number,

    digit: number,

  ): Promise<void> {



    for (
      const trade
      of this.activeTrades.values()
    ) {





      if (
        trade.symbol !== symbol
      ) {

        continue;

      }







      trade.remainingTicks--;







      if (
        trade.remainingTicks > 0
      ) {

        continue;

      }







      const dbTrade =

        await this.prisma.trade.findUnique({

          where: {

            id:
              trade.tradeId,

          },

        });







      if (dbTrade) {


        await this.settlement.settleTrade(
  trade.tradeId,
  price,
  digit,
);


      }








      this.activeTrades.delete(

        trade.tradeId

      );


    }


  }







  /**
   * Return currently open trades
   */

  getOpenTrades(): ActiveTrade[] {


    return Array.from(

      this.activeTrades.values()

    );


  }







  /**
   * Remove trade manually
   */

  removeTrade(

    tradeId:string

  ):void {


    this.activeTrades.delete(

      tradeId

    );


  }



}