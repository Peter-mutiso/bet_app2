import { create } from "zustand";


export interface AITradeRequest {

  symbol:string;

  contractType:
    | "RISE"
    | "FALL"
    | "DIGIT_MATCH"
    | "DIGIT_DIFFERS"
    | "DIGIT_OVER"
    | "DIGIT_UNDER"
    | "EVEN"
    | "ODD";


  confidence:number;

  prediction?:number;

  stake:number;

  tickDuration:number;

}



interface AITradeState {


  tradeRequest:
  AITradeRequest | null;


  executing:boolean;


  lastTradeTime:number | null;



  setTradeRequest:
  (
    trade:AITradeRequest
  )=>void;



  clearTrade:
  ()=>void;



  setExecuting:
  (
    value:boolean
  )=>void;



}



export const useAITradeStore =
create<AITradeState>((set)=>({



tradeRequest:null,


executing:false,


lastTradeTime:null,



setTradeRequest(trade){


set({

tradeRequest:trade,

lastTradeTime:
Date.now()

});


},




clearTrade(){


set({

tradeRequest:null

});


},




setExecuting(value){


set({

executing:value

});


}



}));