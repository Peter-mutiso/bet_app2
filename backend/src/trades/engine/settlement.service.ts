import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WebsocketGateway } from '../../websocket/websocket.gateway';
import { Prisma } from '@prisma/client';

@Injectable()
export class SettlementService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WebsocketGateway,
  ) {}

  async settleTrade(
    tradeId: string,
    exitPrice: number,
    exitDigit: number,
  ) {

    const trade = await this.prisma.trade.findUnique({
      where: {
        id: tradeId,
      },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });


    if (!trade) {
      return null;
    }


    if (trade.status !== 'OPEN') {
      return null;
    }


    if (!trade.user.wallet) {
      throw new Error(
        'User wallet not found',
      );
    }


    let won = false;


    switch (trade.contractType) {

      case 'RISE':
        won = exitPrice > Number(trade.entryPrice);
        break;


      case 'FALL':
        won = exitPrice < Number(trade.entryPrice);
        break;


      case 'EVEN':
        won = exitDigit % 2 === 0;
        break;


      case 'ODD':
        won = exitDigit % 2 === 1;
        break;


      case 'DIGIT_MATCH':
        won = exitDigit === Number(trade.prediction);
        break;


      case 'DIGIT_DIFFERS':
        won = exitDigit !== Number(trade.prediction);
        break;


      case 'DIGIT_OVER':
        won = exitDigit > Number(trade.barrier);
        break;


      case 'DIGIT_UNDER':
        won = exitDigit < Number(trade.barrier);
        break;

    }


    const profit = won
      ? Number(trade.payout) - Number(trade.stake)
      : -Number(trade.stake);



    await this.prisma.$transaction(async (tx) => {


      // Update trade result
      await tx.trade.update({
        where: {
          id: trade.id,
        },

        data: {
          exitPrice: new Prisma.Decimal(exitPrice),
          exitTick: exitDigit,
          settledAt: new Date(),
          profit: new Prisma.Decimal(profit),
          status: won
            ? 'WON'
            : 'LOST',
        },
      });



      // Winner receives payout
      if (won) {

        await tx.wallet.update({
          where: {
            id:trade.user.wallet!.id
          },

          data: {
            balance: {
              increment: Number(trade.payout),
            },
          },
        });


        await tx.walletTransaction.create({
          data: {
            walletId: trade.user.wallet!.id,
            amount: trade.payout,
            type: 'WIN',
            description: `Trade ${trade.id} won`,
          },
        });

      }



      // Losing trade record
      else {

        await tx.walletTransaction.create({
          data: {
            walletId: trade.user.wallet!.id,
            amount: trade.stake,
            type: 'BET',
            description: `Trade ${trade.id} lost`,
          },
        });

      }


    });



    // Notify frontend after database update
    this.gateway.broadcastSettlement({

      tradeId: trade.id,

      status: won
        ? 'WON'
        : 'LOST',

      profit,

      exitPrice,

      exitDigit,

    });



    return {

      tradeId: trade.id,

      status: won
        ? 'WON'
        : 'LOST',

      profit,

      exitPrice,

      exitDigit,

    };

  }

}