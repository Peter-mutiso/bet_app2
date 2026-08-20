import { create } from "zustand";


interface AIMarketState {

  markets: Record<
    string,
    number[]
  >;


  updateMarket: (
    symbol:string,
    price:number
  ) => void;


  getPrices:(
    symbol:string
  )=>number[];

}


export const useAIMarketStore =
create<AIMarketState>((set,get)=>({

  markets:{},


  updateMarket(symbol,price){

    set((state)=>{

      const previous =
        state.markets[symbol] || [];


      return {

        markets:{
          ...state.markets,

          [symbol]:
          [
            ...previous.slice(-100),
            price
          ]

        }

      };

    });

  },


  getPrices(symbol){

    return (
      get().markets[symbol]
      || []
    );

  }


}));