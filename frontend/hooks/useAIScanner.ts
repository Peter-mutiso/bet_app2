"use client";

import { useEffect } from "react";

import {
  analyzeMarket
} from "@/lib/ai/marketScanner";

import {
  useAIScannerStore
} from "@/store/aiScannerStore";

import {
  useAIMarketStore
} from "@/store/aiMarketStore";



export function useAIScanner(){


  const scanning =
    useAIScannerStore(
      (state)=>state.scanning
    );



  const setResults =
    useAIScannerStore(
      (state)=>state.setResults
    );




  useEffect(()=>{


    if(!scanning)
      return;



    const timer =
      setInterval(()=>{


        const markets =
          useAIMarketStore.getState()
            .markets;



        const results =
          Object.entries(markets)
          .map(
            ([symbol, prices])=>{


              return analyzeMarket(
                symbol,
                prices
              );


            }
          );



        if(results.length > 0){

          setResults(results);

        }



      },1000);




    return()=>{

      clearInterval(timer);

    };


  },[
    scanning,
    setResults
  ]);



}