export interface MarketAnalysis {

symbol:string;

score:number;

confidence:number;

trend:
"UP" |
"DOWN" |
"SIDEWAYS";

recommendation:
"RISE" |
"FALL";

}



function calculateTrend(
prices:number[]
){

if(prices.length < 10)
return "SIDEWAYS";


const start =
prices[0];

const end =
prices[prices.length-1];


const change =
((end-start)/start)*100;


if(change > 0.05)
return "UP";


if(change < -0.05)
return "DOWN";


return "SIDEWAYS";

}



function calculateMomentum(
prices:number[]
){

let positive=0;


for(
let i=1;
i<prices.length;
i++
){

if(
prices[i]>prices[i-1]
)
positive++;

}


return (
positive /
prices.length
)*100;

}



export function analyzeMarket(
symbol:string,
prices:number[]
):MarketAnalysis{


const trend =
calculateTrend(prices);


const momentum =
calculateMomentum(prices);


let score =
50;


score += momentum/2;

if(
trend==="UP" ||
trend==="DOWN"
)
{
score+=20;
}


score=Math.min(
100,
score
);



return {
  symbol,
  score,
  confidence: score,
  trend,
  recommendation:
    score >= 80
      ? trend === "UP"
        ? "RISE"
        : trend === "DOWN"
          ? "FALL"
          : "RISE"
      : trend === "DOWN"
        ? "FALL"
        : "RISE",
};
}