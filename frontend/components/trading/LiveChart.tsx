"use client";

import { useEffect, useRef } from "react";
import * as LightweightCharts from "lightweight-charts";
import {
  LineSeries,
  ColorType,
  UTCTimestamp,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";

import { useMarketStore } from "@/store/marketStore";


export default function LiveChart() {

  const chartContainerRef =
    useRef<HTMLDivElement>(null);

  const chartRef =
    useRef<IChartApi | null>(null);

  const seriesRef =
    useRef<ISeriesApi<"Line"> | null>(null);


  const lastTimeRef =
    useRef<number>(
      Math.floor(Date.now() / 1000)
    );


  const displayDigit =
    useMarketStore(
      (state) => state.displayDigit
    );


  const ticks =
    useMarketStore(
      (state) => state.ticks
    );


  /*
    CREATE CHART
  */
  useEffect(() => {

    if (!chartContainerRef.current)
      return;


    const chart =
      LightweightCharts.createChart(
        chartContainerRef.current,
        {

          layout: {

            background: {

              type:
              ColorType.Solid,

              color:
              "transparent",

            },

            textColor:
            "#94a3b8",

          },


          grid: {

            vertLines: {

              visible:false,

            },

            horzLines: {

              color:"#1e293b",

            },

          },


          width:
          chartContainerRef.current.clientWidth,


          height:180,


          rightPriceScale: {

            borderVisible:false,

            autoScale:true,

          },


          timeScale: {

            visible:false,

            rightOffset:5,

            barSpacing:8,

            lockVisibleTimeRangeOnResize:true,

          },


          handleScroll: {

            mouseWheel:false,

            pressedMouseMove:false,

          },


          handleScale: {

            mouseWheel:false,

            pinch:false,

            axisPressedMouseMove:false,

          },

        }
      );


    const series =
      chart.addSeries(
        LineSeries,
        {

          color:
          "#14b8a6",

          lineWidth:3,

          crosshairMarkerVisible:false,

          priceLineVisible:false,

          lastValueVisible:false,

          autoscaleInfoProvider:()=>({

            priceRange:{

              minValue:0,

              maxValue:9,

            },

          }),

        }
      );


    chartRef.current = chart;

    seriesRef.current = series;



    /*
      LOAD INITIAL HISTORY
    */

    if(ticks.length){

      const startTime =
        Math.floor(Date.now()/1000)
        -
        ticks.length;


      const history =
        ticks
        .slice(-60)
        .map(
          (digit,index)=>({

            time:
            (
              startTime + index
            ) as UTCTimestamp,

            value:
            digit,

          })
        );


      series.setData(history);


      lastTimeRef.current =
        startTime +
        history.length;


      chart.timeScale()
      .fitContent();

    }



    /*
      Resize
    */

    const resize = ()=>{

      if(chartContainerRef.current){

        chart.applyOptions({

          width:
          chartContainerRef.current.clientWidth,

        });

      }

    };


    window.addEventListener(
      "resize",
      resize
    );


    return()=>{

      window.removeEventListener(
        "resize",
        resize
      );

      chart.remove();

    };


  },[]);



  /*
    UPDATE CHART SMOOTHLY
  */

  useEffect(()=>{

    if(
      !seriesRef.current ||
      displayDigit === null
    )
      return;



    lastTimeRef.current += 1;


    seriesRef.current.update({

      time:
      lastTimeRef.current as UTCTimestamp,

      value:
      displayDigit,

    });



    /*
      Keep sliding window
      prevents jumping
    */

    chartRef.current
      ?.timeScale()
      .setVisibleLogicalRange({

        from:
        Math.max(
          0,
          lastTimeRef.current - 50
        ),

        to:
        lastTimeRef.current + 5,

      });


  },[displayDigit]);



  return (

    <div
      ref={chartContainerRef}
      className="
        w-full
        h-[180px]
        overflow-hidden
      "
    />

  );

}