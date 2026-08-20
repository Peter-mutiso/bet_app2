"use client";


import { useMarketStore } from "@/store/marketStore";
import DigitDisplay from "./DigitDisplay";


export default function PriceCard() {


  const price = useMarketStore((state) => state.price);

const digit = useMarketStore((state) => state.digit);

const ticks = useMarketStore((state) => state.ticks);



  const previousPrice =

    useMarketStore(

      (state) => state.previousPrice

    );





  const movement =

    price > previousPrice

    ? "↑"

    :

    price < previousPrice

    ? "↓"

    :

    "";






  return (

    <div

      className="
      rounded-2xl
      border
      border-zinc-800
      bg-zinc-900
      p-8
      shadow-xl
      text-white
      "

    >



      <div className="text-center">



        <p

          className="
          text-zinc-400
          text-sm
          uppercase
          tracking-widest
          "

        >

          Synthetic Index

        </p>





        <h2

          className="
          mt-2
          text-2xl
          font-bold
          "

        >

          R_100

        </h2>








        <div className="mt-8">


          <p

            className="
            text-zinc-500
            text-sm
            "

          >

            Current Price

          </p>






          <div

            className="
            mt-2
            flex
            justify-center
            items-center
            gap-3
            "

          >


            <h1

              className="
              text-6xl
              font-bold
              text-green-400
              transition-all
              "

            >

              {Number(price).toFixed(4)}

            </h1>



            <span

              className={

                movement === "↓"

                ?

                "text-red-400 text-3xl"

                :

                "text-green-400 text-3xl"

              }

            >

              {movement}

            </span>



          </div>



        </div>







        <div className="mt-8">


          <p

            className="
            mb-2
            text-zinc-500
            text-sm
            "

          >

            Last Digit

          </p>



          <DigitDisplay
          />

              

        </div>





      </div>



    </div>

  );

}