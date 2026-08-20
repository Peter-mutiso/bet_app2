"use client";

import { useEffect } from "react";

import { getSocket } from "@/lib/socket";

import {
  useAIMarketStore
} from "@/store/aiMarketStore";


interface TickData {
  symbol: string;
  price: number;
}


export function useAIMarketFeed() {


  const updateMarket =
    useAIMarketStore(
      (state)=>state.updateMarket
    );



  useEffect(()=>{


    const socket =
      getSocket();



    function handleTick(
      data: TickData
    ){


      if(
        !data?.symbol ||
        typeof data.price !== "number"
      ){

        return;

      }



      updateMarket(
        data.symbol,
        data.price
      );


    }



    socket.on(
      "tick",
      handleTick
    );



    return()=>{


      socket.off(
        "tick",
        handleTick
      );


    };


  },[
    updateMarket
  ]);



}