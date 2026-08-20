import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { TradeEngineService } from './engine/trade-engine.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma, TradeStatus } from '@prisma/client';
import { MarketService } from '../market/market.service';



@Injectable()
export class TradesService {


  constructor(

    private readonly prisma: PrismaService,

    private readonly engine: TradeEngineService,

    private readonly market: MarketService,

  ) {}





  async createTrade(dto: any) {


    const userId =
      dto.userId;



    const user =
      await this.prisma.user.findUnique({

        where:{
          id:userId,
        },

        include:{
          wallet:true,
        },

      });




    if(!user)

      throw new NotFoundException(
        "User not found"
      );





    if(!user.wallet)

      throw new BadRequestException(
        "Wallet not found"
      );






    const stake =
      Number(dto.stake);



    if(
      !stake ||
      stake <= 0
    )

      throw new BadRequestException(
        "Invalid stake"
      );






    const balance =
      Number(
        user.wallet.balance
      );




    if(balance < stake)

      throw new BadRequestException(
        "Insufficient balance"
      );







    const current =
      this.market.getCurrentTick();




    if(!current)

      throw new BadRequestException(
        "Market unavailable"
      );







    const payout =
      stake * 1.95;








    const trade =

      await this.prisma.$transaction(

        async(tx)=>{






          await tx.wallet.update({

            where:{
              id:user.wallet!.id,
            },

            data:{

              balance:{

                decrement: stake,

              },

            },

          });







          const created =

            await tx.trade.create({

              data:{


                symbol:
                  dto.symbol,


                contractType:
                  dto.contractType,


                barrier:
                  dto.barrier,


                prediction:
                  dto.prediction,



                tickDuration:
                  dto.tickDuration,



                entryPrice:

                  new Prisma.Decimal(
                    current.price
                  ),




                entryTick:

                  current.digit,




                stake:

                  new Prisma.Decimal(
                    stake
                  ),




                payout:

                  new Prisma.Decimal(
                    payout
                  ),




                status:
                  TradeStatus.OPEN,



                userId,


              },

            });







          await tx.walletTransaction.create({

            data:{


              walletId:
                user.wallet!.id,



              amount:

                new Prisma.Decimal(
                  stake
                ),



              type:
                'BET',




              description:

                `Trade ${created.id}`,



            },

          });







          return created;



        }

      );







    this.engine.addTrade(

      trade.id,

      trade.symbol,

      trade.tickDuration,

    );








    return {

      id:
        trade.id,


      symbol:
        trade.symbol,


      contractType:
        trade.contractType,


      prediction:
        trade.prediction,


      barrier:
        trade.barrier,


      tickDuration:
        trade.tickDuration,


      entryPrice:
        Number(
          trade.entryPrice
        ),


      entryTick:
        trade.entryTick,


      stake:
        Number(
          trade.stake
        ),


      payout:
        Number(
          trade.payout
        ),


      status:
        trade.status,


      createdAt:
        trade.createdAt,


    };


  }








  async history(
    userId:string
  ){


    return this.prisma.trade.findMany({

      where:{
        userId,
      },


      orderBy:{

        createdAt:'desc',

      },


    });


  }



}