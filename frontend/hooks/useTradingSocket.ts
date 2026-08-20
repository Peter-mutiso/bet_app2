"use client";


import { useEffect } from "react";
import { useMarketStore } from "@/store/marketStore";
import { getSocket } from "@/lib/socket";

import { useTradeStore } from "@/store/tradeStore";

import { useWalletStore } from "@/store/walletStore";



export function useTradingSocket() {


  const settleTrade =

    useTradeStore(

      (state) => state.settleTrade

    );
    const setTick =
  useMarketStore(
    (state)=>state.setTick
  );



  const updateTrade =

    useTradeStore(

      (state) => state.updateTrade

    );



  const updateBalance =

    useWalletStore(

      (state) => state.updateBalance

    );


  useEffect(() => {



    const socket =
      getSocket();







    function handleConnect() {


      console.log(

        "Socket connected:",

        socket.id

      );


    }









    function handleTick(
  tick: any
) {

  console.log(
    "Market tick:",
    tick
  );

  if (!tick) {
    return;
  }

  setTick(
    Number(tick.price),
    Number(tick.digit)
  );

}
    function handleSettlement(
      result:any
    ) {



      console.log(

        "Trade settlement:",

        result

      );





      if(
        !result?.tradeId
      ){

        return;

      }







      settleTrade(

        result.tradeId,

        result.status,

        Number(
          result.profit ?? 0
        )

      );







      /*
        Backend already updated database.

        This only updates the demo UI.
      */


      if(

        result.status === "WON"

        &&

        result.profit

      ){



        updateBalance(

          Number(
            result.profit
          )

        );


      }





    }








    socket.on(

      "connect",

      handleConnect

    );





    socket.on(

      "tick",

      handleTick

    );





    socket.on(

      "settlement",

      handleSettlement

    );









    return ()=>{


      socket.off(

        "connect",

        handleConnect

      );



      socket.off(

        "tick",

        handleTick

      );



      socket.off(

        "settlement",

        handleSettlement

      );


    };





  },[

    settleTrade,

    updateTrade,

    updateBalance,
    setTick

  ]);



}