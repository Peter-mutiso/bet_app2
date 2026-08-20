"use client";

import { useAITradeStore } from "@/store/aiTradeStore";
import { useAIScannerStore } from "@/store/aiScannerStore";
import { useMarketStore } from "@/store/marketStore";


export default function AITradeExecutor(){

  const bestTrade =
    useAIScannerStore(
      (state)=>state.bestTrade
    );


  const {
    stake,
    numberOfTicks
  } =
    useMarketStore();


  const setTradeRequest =
    useAITradeStore(
      (state)=>state.setTradeRequest
    );


  function execute(){

    if(!bestTrade)
      return;


    if(
      bestTrade.confidence < 80
    ){

      console.log(
        "AI confidence too low"
      );

      return;
    }


    setTradeRequest({

      symbol:
        bestTrade.symbol,


      contractType:
        bestTrade.recommendation,


      confidence:
        bestTrade.confidence,


      stake,


      tickDuration:
        numberOfTicks,


    });


    console.log(
      "AI trade request sent"
    );

  }



return (

<button

onClick={execute}

className="
w-full
rounded-xl
bg-gradient-to-r
from-purple-600
to-cyan-500
py-3
font-bold
text-white
"

>

🤖 AI Execute Trade

</button>

);


}