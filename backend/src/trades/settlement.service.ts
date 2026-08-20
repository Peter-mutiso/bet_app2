import { Injectable } from '@nestjs/common';
import { TradeStatus } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';
import { MarketService } from '../market/market.service';
import { TradeEngine } from './engine/trade.engine';
import { WebsocketGateway } from '../websocket/websocket.gateway';



@Injectable()
export class SettlementService {


    private engine =
        new TradeEngine();



    constructor(

        private readonly prisma: PrismaService,

        private readonly market: MarketService,

        private readonly gateway: WebsocketGateway,

    ) {}

    async settleTrade(
        trade:any,
        tick:any
    ) {



        const result =
            this.engine.settle(
                trade,
                tick
            );





        const profit =

            result.won

            ?

            Number(trade.payout)
            -
            Number(trade.stake)

            :

            -Number(trade.stake);







        await this.prisma.$transaction(

            async(tx)=>{





                await tx.trade.update({

                    where:{
                        id:trade.id,
                    },

                    data:{


                        status:

                            result.status === "WON"

                            ?

                            TradeStatus.WON

                            :

                            TradeStatus.LOST,



                        exitPrice:
                            result.exitPrice,



                        exitTick:
                            result.exitDigit,



                        settledAt:
                            result.settledAt,



                        profit,

                    },

                });







                if(result.won){



                    const wallet =
                        await tx.wallet.findUnique({

                            where:{
                                userId:
                                    trade.userId,
                            },

                        });





                    if(wallet){


                        await tx.wallet.update({

                            where:{
                                id:wallet.id,
                            },


                            data:{


                                balance:{

                                    increment:
                                        Number(
                                            trade.payout
                                        ),

                                },


                            },

                        });





                        await tx.walletTransaction.create({

                            data:{


                                walletId:
                                    wallet.id,


                                amount:
                                    Number(
                                        trade.payout
                                    ),


                                type:
                                    "WIN",


                                description:
                                    `Trade ${trade.id}`,


                            },

                        });


                    }


                }


            }

        );








        this.gateway.broadcastSettlement({

            tradeId:
                trade.id,


            status:
                result.status,


            profit,


            digit:
                result.exitDigit,


        });



    }



}