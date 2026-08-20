"use client";


import { useEffect } from "react";

import { getWallet } from "@/lib/wallet";

import {
  useWalletStore
} from "@/store/walletStore";



export function useWallet() {


  const setBalance =
    useWalletStore(
      (state)=>state.setBalance
    );



  useEffect(()=>{


    async function loadWallet(){


      try {


        const wallet =
          await getWallet();



        setBalance(
          Number(
            wallet.balance
          )
        );



      } catch(error){


        console.error(
          "Wallet loading failed",
          error
        );


      }


    }



    loadWallet();



  },[
    setBalance
  ]);



}