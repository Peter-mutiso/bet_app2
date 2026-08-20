"use client";


import { useEffect } from "react";

import {
  useTradeStore,
} from "@/store/tradeStore";



export function useTradeTimer() {



  const removeTrade =

    useTradeStore(

      (state) => state.removeTrade

    );





  const trades =

    useTradeStore(

      (state) => state.openTrades

    );






  useEffect(() => {



    const timer =

      setInterval(()=>{





        trades.forEach(

          (trade)=>{



            /*
              Backend controls settlement.

              Remove old completed trades
              from UI after displaying result.
            */


            if(

              trade.status !== "OPEN"

            ){


              setTimeout(()=>{


                removeTrade(
                  trade.id
                );


              },5000);


            }



          }

        );



      },1000);






    return ()=>{


      clearInterval(timer);


    };



  },[

    trades,

    removeTrade,

  ]);



}